/**
 * AR DRAGON ARENA – Core Game Engine & WebAR Controller
 * Built with HTML5, CSS3, JavaScript & Google Model Viewer
 */

(function () {
  'use strict';

  // ========================================================
  // 1. GAME STATE & AUDIO ENGINE
  // ========================================================
  const gameState = {
    dragon: {
      name: 'INFERNO',
      maxHp: 1000,
      currentHp: 1000,
      attack: 850,
      defence: 720,
      level: 25,
      element: 'Fire',
      rarity: 'Legendary'
    },
    target: {
      name: 'Frost Wyrm Dummy',
      maxHp: 2000,
      currentHp: 2000
    },
    sfxEnabled: true,
    introEnded: false,
    autoRotate: true,
    lightLevel: 1.2
  };

  // Web Audio API Synthesizer (Zero External Dependencies)
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  const SoundFX = {
    // Fire Attack: Roar + Flame Blast Sweep
    playFireAttack() {
      if (!gameState.sfxEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        // 1. Low Dragon Roar (Sawtooth with filter envelope)
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.6);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.7);

        oscGain.gain.setValueAtTime(0.4, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.8);

        // 2. White Noise Fire Blast
        const bufferSize = ctx.sampleRate * 0.75;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(900, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(250, now + 0.7);
        noiseFilter.Q.setValueAtTime(2.0, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noise.start(now + 0.05);
      } catch (err) {
        console.warn('Audio playFireAttack warning:', err);
      }
    },

    // Heal Chime: Soothing Ascending Harmonic Arpeggio
    playHeal() {
      if (!gameState.sfxEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0.001, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.08 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.5);
        });
      } catch (err) {
        console.warn('Audio playHeal warning:', err);
      }
    },

    // UI Click Feedback
    playClick() {
      if (!gameState.sfxEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
      } catch (err) {
        // Ignored
      }
    },

    // Damage rumble punch
    playDamage() {
      if (!gameState.sfxEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.36);
      } catch (err) {
        // Ignored
      }
    },

    // Reset bell
    playReset() {
      if (!gameState.sfxEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        [880, 587.33].forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.1);
          gain.gain.setValueAtTime(0.2, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.4);
        });
      } catch (err) {
        // Ignored
      }
    }
  };

  // ========================================================
  // 2. DOM REFERENCES
  // ========================================================
  const DOM = {
    // Intro
    introOverlay: document.getElementById('introOverlay'),
    introVideo: document.getElementById('introVideo'),
    skipIntroBtn: document.getElementById('skipIntroBtn'),
    introSoundToggle: document.getElementById('introSoundToggle'),
    introSoundIcon: document.getElementById('introSoundIcon'),
    introSoundText: document.getElementById('introSoundText'),
    introProgressFill: document.getElementById('introProgressFill'),

    // App Wrapper
    appContainer: document.getElementById('appContainer'),
    screenShakeOverlay: document.getElementById('screenShakeOverlay'),
    toastContainer: document.getElementById('toastContainer'),

    // Header & Actions
    sfxToggleBtn: document.getElementById('sfxToggleBtn'),
    sfxIcon: document.getElementById('sfxIcon'),
    sfxLabel: document.getElementById('sfxLabel'),
    arStatusPill: document.getElementById('arStatusPill'),
    arStatusText: document.getElementById('arStatusText'),

    // 3D Model Viewer
    dragonViewer: document.getElementById('dragonViewer'),
    modelPoster: document.getElementById('modelPoster'),
    modelLoadingFill: document.getElementById('modelLoadingFill'),
    hiddenArButton: document.getElementById('hiddenArButton'),
    summonArBtn: document.getElementById('summonArBtn'),
    toggleAutoRotateBtn: document.getElementById('toggleAutoRotateBtn'),
    resetCameraBtn: document.getElementById('resetCameraBtn'),
    toggleLightsBtn: document.getElementById('toggleLightsBtn'),
    floatingTextContainer: document.getElementById('floatingTextContainer'),

    // Stats HUD
    hpTextDisplay: document.getElementById('hpTextDisplay'),
    hpBarFill: document.getElementById('hpBarFill'),
    atkTextDisplay: document.getElementById('atkTextDisplay'),
    atkBarFill: document.getElementById('atkBarFill'),
    defTextDisplay: document.getElementById('defTextDisplay'),
    defBarFill: document.getElementById('defBarFill'),

    // Controls
    fireAttackBtn: document.getElementById('fireAttackBtn'),
    healDragonBtn: document.getElementById('healDragonBtn'),
    resetStatsBtn: document.getElementById('resetStatsBtn'),
    takeDamageBtn: document.getElementById('takeDamageBtn'),

    // Target Boss
    targetHpText: document.getElementById('targetHpText'),
    targetBarFill: document.getElementById('targetBarFill'),

    // Battle Log
    battleLogContainer: document.getElementById('battleLogContainer'),
    clearLogBtn: document.getElementById('clearLogBtn'),

    // QR Code Section
    qrCodeContainer: document.getElementById('qrCodeContainer'),
    qrUrlInput: document.getElementById('qrUrlInput'),
    updateQrBtn: document.getElementById('updateQrBtn'),
    copyUrlBtn: document.getElementById('copyUrlBtn'),
    resetUrlBtn: document.getElementById('resetUrlBtn'),
    qrUrlCaption: document.getElementById('qrUrlCaption'),

    // Modal
    arModal: document.getElementById('arModal'),
    modalQrContainer: document.getElementById('modalQrContainer'),
    closeArModalBtn: document.getElementById('closeArModalBtn'),
    modalGotItBtn: document.getElementById('modalGotItBtn'),

    // Canvases
    particlesCanvas: document.getElementById('particlesCanvas'),
    fireFxCanvas: document.getElementById('fireFxCanvas')
  };

  // ========================================================
  // 3. INTRO VIDEO LOGIC
  // ========================================================
  function setupIntroVideo() {
    const video = DOM.introVideo;
    if (!video) return;

    // Autoplay attempt
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Browser autoplay blocked audio or auto-playback; keep muted and wait for tap
        video.muted = true;
        video.play().catch(e => console.warn('Autoplay prevented:', e));
      });
    }

    // Sound toggle on intro screen
    if (DOM.introSoundToggle) {
      DOM.introSoundToggle.addEventListener('click', () => {
        getAudioContext();
        video.muted = !video.muted;
        if (video.muted) {
          DOM.introSoundIcon.textContent = '🔇';
          DOM.introSoundText.textContent = 'UNMUTE SOUND';
        } else {
          DOM.introSoundIcon.textContent = '🔊';
          DOM.introSoundText.textContent = 'MUTE SOUND';
          video.volume = 1.0;
        }
      });
    }

    // Video progress update
    video.addEventListener('timeupdate', () => {
      if (video.duration && DOM.introProgressFill) {
        const pct = (video.currentTime / video.duration) * 100;
        DOM.introProgressFill.style.width = `${pct}%`;
      }
    });

    // When video ends naturally, transition smoothly
    video.addEventListener('ended', () => {
      completeIntro();
    });

    // Skip Button
    if (DOM.skipIntroBtn) {
      DOM.skipIntroBtn.addEventListener('click', () => {
        SoundFX.playClick();
        completeIntro();
      });
    }

    // Safety fallback: If video takes longer than 30s or stalls, allow entering
    setTimeout(() => {
      if (!gameState.introEnded) {
        // Ensure user can still skip anytime
      }
    }, 25000);
  }

  function completeIntro() {
    if (gameState.introEnded) return;
    gameState.introEnded = true;

    // Smooth fade out
    if (DOM.introOverlay) {
      DOM.introOverlay.classList.add('fade-out');
      setTimeout(() => {
        DOM.introOverlay.style.display = 'none';
        if (DOM.introVideo) {
          DOM.introVideo.pause();
        }
      }, 850);
    }

    // Greet user in battle log
    addBattleLog('🐉 INFERNO summoned to the Arena! WebAR systems online.', 'system');
    showToast('🐲 Welcome to AR Dragon Arena! Summon your legend.', 'attack');
  }

  // ========================================================
  // 4. GOOGLE MODEL VIEWER & WEBAR INTEGRATION
  // ========================================================
  function setupModelViewer() {
    const viewer = DOM.dragonViewer;
    if (!viewer) return;

    // Model Loading Progress
    viewer.addEventListener('progress', (e) => {
      const progress = e.detail.totalProgress;
      if (DOM.modelLoadingFill) {
        DOM.modelLoadingFill.style.width = `${Math.round(progress * 100)}%`;
      }
    });

    // Model Loaded Successfully
    viewer.addEventListener('load', () => {
      if (DOM.modelPoster) {
        DOM.modelPoster.style.transition = 'opacity 0.5s ease';
        DOM.modelPoster.style.opacity = '0';
        setTimeout(() => {
          DOM.modelPoster.style.display = 'none';
        }, 550);
      }
      addBattleLog('✅ 3D Dragon model (Inferno) loaded into summoning podium.', 'system');
    });

    // Model Loading Error Fallback
    viewer.addEventListener('error', (err) => {
      console.error('Error loading 3D dragon model:', err);
      if (DOM.modelPoster) {
        DOM.modelPoster.innerHTML = `
          <div style="text-align: center; color: #ff5252; padding: 20px;">
            <div style="font-size: 2.5rem; margin-bottom: 8px;">⚠️</div>
            <div style="font-family: var(--font-hud); font-weight: 800;">3D DRAGON MODEL LOAD ISSUE</div>
            <p style="font-size: 0.85rem; color: #bbb; margin-top: 6px;">Ensure <code>assets/dragon.glb</code> is in the directory.</p>
          </div>
        `;
      }
    });

    // AR Status Detection
    viewer.addEventListener('ar-status', (event) => {
      const status = event.detail.status;
      if (DOM.arStatusText) {
        if (status === 'session-started') {
          DOM.arStatusText.textContent = 'AR ACTIVE';
          addBattleLog('📱 AR Session initiated! Placing dragon on surface...', 'system');
        } else if (status === 'not-presenting') {
          DOM.arStatusText.textContent = 'WEBAR READY';
        } else if (status === 'failed') {
          DOM.arStatusText.textContent = 'AR FALLBACK';
          showToast('⚠️ AR activation could not start. Using 3D viewer.', 'damage');
        }
      }
    });

    // Check device WebAR compatibility
    if (viewer.canActivateAR) {
      if (DOM.arStatusPill) {
        DOM.arStatusPill.title = 'Device supports direct WebAR activation';
      }
    }

    // Toggle Auto-Rotate Button
    if (DOM.toggleAutoRotateBtn) {
      DOM.toggleAutoRotateBtn.addEventListener('click', () => {
        SoundFX.playClick();
        gameState.autoRotate = !gameState.autoRotate;
        viewer.autoRotate = gameState.autoRotate;
        if (gameState.autoRotate) {
          DOM.toggleAutoRotateBtn.classList.add('active');
          DOM.toggleAutoRotateBtn.querySelector('.label').textContent = 'Rotate: ON';
        } else {
          DOM.toggleAutoRotateBtn.classList.remove('active');
          DOM.toggleAutoRotateBtn.querySelector('.label').textContent = 'Rotate: OFF';
        }
      });
    }

    // Reset Camera Perspective Button
    if (DOM.resetCameraBtn) {
      DOM.resetCameraBtn.addEventListener('click', () => {
        SoundFX.playClick();
        viewer.cameraOrbit = '30deg 75deg 3.6m';
        viewer.cameraTarget = '0m 0m 0m';
        viewer.fieldOfView = '32deg';
        showToast('🎯 Camera angle reset to podium center.', 'heal');
      });
    }

    // Boost Lighting Button
    if (DOM.toggleLightsBtn) {
      DOM.toggleLightsBtn.addEventListener('click', () => {
        SoundFX.playClick();
        if (gameState.lightLevel === 1.2) {
          gameState.lightLevel = 1.7;
          DOM.toggleLightsBtn.querySelector('.label').textContent = 'Light: Ultra';
          DOM.toggleLightsBtn.classList.add('active');
        } else if (gameState.lightLevel === 1.7) {
          gameState.lightLevel = 0.85;
          DOM.toggleLightsBtn.querySelector('.label').textContent = 'Light: Dark';
          DOM.toggleLightsBtn.classList.remove('active');
        } else {
          gameState.lightLevel = 1.2;
          DOM.toggleLightsBtn.querySelector('.label').textContent = 'Light: Normal';
          DOM.toggleLightsBtn.classList.remove('active');
        }
        viewer.exposure = gameState.lightLevel;
      });
    }

    // PRIMARY "SUMMON DRAGON IN AR" BUTTON HANDLER
    if (DOM.summonArBtn) {
      DOM.summonArBtn.addEventListener('click', () => {
        SoundFX.playClick();
        launchAugmentedReality();
      });
    }
  }

  // Launch AR or open instructions modal
  function launchAugmentedReality() {
    const viewer = DOM.dragonViewer;

    // Check if device can activate AR natively
    const canActivate = viewer && viewer.canActivateAR;

    // Also check if mobile user agent
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (canActivate || isMobile) {
      // Try to trigger AR
      try {
        if (viewer.activateAR) {
          viewer.activateAR();
        } else if (DOM.hiddenArButton) {
          DOM.hiddenArButton.click();
        }
        showToast('📱 Summoning Inferno in Augmented Reality...', 'attack');
        addBattleLog('⚡ AR Summon requested. Point camera at floor or table.', 'system');
      } catch (err) {
        console.warn('Direct AR launch attempted:', err);
        openArModal();
      }
    } else {
      // Desktop / Non-AR fallback: Open instructional modal with scannable QR
      openArModal();
    }
  }

  function openArModal() {
    if (DOM.arModal) {
      DOM.arModal.classList.add('active');
      DOM.arModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeArModal() {
    if (DOM.arModal) {
      DOM.arModal.classList.remove('active');
      DOM.arModal.setAttribute('aria-hidden', 'true');
    }
  }

  // ========================================================
  // 5. DRAGON STATISTICS & INTERACTIVE GAME CONTROLS
  // ========================================================
  function updateStatsUI() {
    const { dragon, target } = gameState;

    // Health UI
    if (DOM.hpTextDisplay) {
      DOM.hpTextDisplay.textContent = `${dragon.currentHp} / ${dragon.maxHp} HP`;
    }

    if (DOM.hpBarFill) {
      const hpPct = Math.max(0, Math.min(100, (dragon.currentHp / dragon.maxHp) * 100));
      DOM.hpBarFill.style.width = `${hpPct}%`;

      // Color coding based on health threshold
      DOM.hpBarFill.classList.remove('hp-mid', 'hp-low');
      if (hpPct <= 25) {
        DOM.hpBarFill.classList.add('hp-low');
      } else if (hpPct <= 55) {
        DOM.hpBarFill.classList.add('hp-mid');
      }
    }

    // Target Dummy UI
    if (DOM.targetHpText) {
      DOM.targetHpText.textContent = `${target.currentHp} / ${target.maxHp} HP`;
    }
    if (DOM.targetBarFill) {
      const targetPct = Math.max(0, Math.min(100, (target.currentHp / target.maxHp) * 100));
      DOM.targetBarFill.style.width = `${targetPct}%`;
    }
  }

  // Action: FIRE ATTACK
  function executeFireAttack() {
    SoundFX.playFireAttack();

    // 1. Screen Shake & Flash
    triggerScreenShake();
    triggerFireFlash();

    // 2. Fire Breath Particle Burst
    triggerFireParticlesBurst();

    // 3. Combat Calculations
    const damage = gameState.dragon.attack; // 850 DMG
    gameState.target.currentHp = Math.max(0, gameState.target.currentHp - damage);

    // 4. Floating Combat Text
    spawnFloatingText(`-${damage} 🔥 CRIT!`, 'fire');

    // 5. Notification & Log
    showToast(`🔥 INFERNO unleashed HELLFIRE BREATH! Inflicted ${damage} Critical Damage!`, 'attack');
    addBattleLog(`🔥 INFERNO cast HELLFIRE BREATH! Dealt ${damage} Fire Damage to Arena Target.`, 'attack');

    // Check target defeat
    if (gameState.target.currentHp === 0) {
      setTimeout(() => {
        showToast('💀 Arena Target destroyed by Hellfire! Respawning...', 'attack');
        addBattleLog('💀 Arena Target incinerated into ash. Respawning Frost Wyrm Dummy.', 'system');
        gameState.target.currentHp = gameState.target.maxHp;
        updateStatsUI();
      }, 1200);
    }

    updateStatsUI();
  }

  // Action: HEAL DRAGON (+100 HP, max 1000)
  function executeHealDragon() {
    const dragon = gameState.dragon;

    if (dragon.currentHp >= dragon.maxHp) {
      SoundFX.playClick();
      showToast('💖 INFERNO is already at maximum health (1000/1000 HP)!', 'heal');
      spawnFloatingText('MAX HP', 'heal');
      addBattleLog('ℹ️ Vitality check: INFERNO is already at full 1000 HP.', 'system');
      return;
    }

    SoundFX.playHeal();

    const healAmount = 100;
    const oldHp = dragon.currentHp;
    dragon.currentHp = Math.min(dragon.maxHp, dragon.currentHp + healAmount);
    const actualHealed = dragon.currentHp - oldHp;

    spawnFloatingText(`+${actualHealed} HP 💚`, 'heal');
    showToast(`💚 INFERNO restored +${actualHealed} HP! (${dragon.currentHp}/${dragon.maxHp} HP)`, 'heal');
    addBattleLog(`💚 INFERNO consumed Phoenix Ash: Restored +${actualHealed} HP (${dragon.currentHp}/${dragon.maxHp} HP).`, 'heal');

    updateStatsUI();
  }

  // Action: RESET STATS
  function executeResetStats() {
    SoundFX.playReset();

    gameState.dragon.currentHp = 1000;
    gameState.dragon.attack = 850;
    gameState.dragon.defence = 720;
    gameState.target.currentHp = 2000;

    updateStatsUI();
    spawnFloatingText('STATS RESET 🔄', 'heal');
    showToast('🔄 Arena stats restored to default Legendary values (1000 HP, 850 ATK).', 'heal');
    addBattleLog('🔄 Arena battlefield reset. INFERNO restored to initial combat state.', 'system');
  }

  // Action: SIMULATE ENEMY HIT (Lets user test health dropping and healing!)
  function executeSimulateDamage() {
    SoundFX.playDamage();
    triggerScreenShake();

    const incomingDamage = 200;
    gameState.dragon.currentHp = Math.max(100, gameState.dragon.currentHp - incomingDamage);

    spawnFloatingText(`-${incomingDamage} HP 💥`, 'fire');
    showToast(`💥 Frost Wyrm struck INFERNO for ${incomingDamage} damage! Test HEAL DRAGON.`, 'damage');
    addBattleLog(`💥 Enemy attack struck INFERNO for ${incomingDamage} damage (${gameState.dragon.currentHp}/1000 HP).`, 'damage');

    updateStatsUI();
  }

  // Screen Shake FX
  function triggerScreenShake() {
    if (DOM.appContainer) {
      DOM.appContainer.classList.remove('screen-shake');
      // Reflow
      void DOM.appContainer.offsetWidth;
      DOM.appContainer.classList.add('screen-shake');
      setTimeout(() => {
        DOM.appContainer.classList.remove('screen-shake');
      }, 500);
    }
  }

  // Fire Flash FX
  function triggerFireFlash() {
    if (DOM.screenShakeOverlay) {
      DOM.screenShakeOverlay.classList.add('active');
      setTimeout(() => {
        DOM.screenShakeOverlay.classList.remove('active');
      }, 350);
    }
  }

  // Floating Combat Numbers
  function spawnFloatingText(text, type) {
    if (!DOM.floatingTextContainer) return;

    const el = document.createElement('div');
    el.className = `floating-dmg-text ${type}`;
    el.textContent = text;

    // Randomize slightly near center
    const x = 50 + (Math.random() * 20 - 10);
    const y = 45 + (Math.random() * 20 - 10);
    el.style.left = `${x}%`;
    el.style.top = `${y}%`;

    DOM.floatingTextContainer.appendChild(el);

    setTimeout(() => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 1300);
  }

  // HUD Toast Alerts
  function showToast(message, type = 'attack') {
    if (!DOM.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast-alert ${type}`;

    let icon = '🔥';
    if (type === 'heal') icon = '💚';
    if (type === 'damage') icon = '💥';
    if (type === 'system') icon = '⚡';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-msg">${message}</span>
    `;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 400);
    }, 3200);
  }

  // Battle Log Feed
  function addBattleLog(text, category = 'system') {
    if (!DOM.battleLogContainer) return;

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const entry = document.createElement('div');
    entry.className = `log-entry ${category}`;
    entry.innerHTML = `
      <span class="log-time">[${timeStr}]</span>
      <span class="log-text">${text}</span>
    `;

    DOM.battleLogContainer.prepend(entry);

    // Limit log length to 35 items
    while (DOM.battleLogContainer.children.length > 35) {
      DOM.battleLogContainer.removeChild(DOM.battleLogContainer.lastChild);
    }
  }

  // ========================================================
  // 6. QR CODE WEBAR ACCESS (Authentic Client-Side QR Generator)
  // ========================================================
  let currentQrCodeInstance = null;
  let modalQrCodeInstance = null;

  function getEffectiveUrl() {
    let url = window.location.href;

    // If opened via local filesystem (file:// protocol)
    if (url.startsWith('file:')) {
      // Provide user's LAN IP / tunnel placeholder so phone camera scan can connect
      return 'http://10.178.11.87:8000';
    }
    return url;
  }

  function renderQrCode(targetUrl) {
    if (typeof QRCode === 'undefined') {
      console.warn('QRCode library not ready yet');
      return;
    }

    const cleanUrl = targetUrl.trim();

    // 1. Main QR Code Section
    if (DOM.qrCodeContainer) {
      DOM.qrCodeContainer.innerHTML = '';
      currentQrCodeInstance = new QRCode(DOM.qrCodeContainer, {
        text: cleanUrl,
        width: 200,
        height: 200,
        colorDark: '#08080c',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    }

    // 2. Modal QR Code Preview
    if (DOM.modalQrContainer) {
      DOM.modalQrContainer.innerHTML = '';
      modalQrCodeInstance = new QRCode(DOM.modalQrContainer, {
        text: cleanUrl,
        width: 140,
        height: 140,
        colorDark: '#08080c',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    }

    if (DOM.qrUrlCaption) {
      if (window.location.protocol === 'file:') {
        DOM.qrUrlCaption.innerHTML = `Scanning URL: <strong>${cleanUrl}</strong><br><span style="color:#ffaa00;font-size:0.75rem;">(Serving locally on LAN / Deploy to HTTPS for WebAR)</span>`;
      } else {
        DOM.qrUrlCaption.textContent = cleanUrl;
      }
    }

    if (DOM.qrUrlInput) {
      DOM.qrUrlInput.value = cleanUrl;
    }
  }

  function setupQrCode() {
    const initialUrl = getEffectiveUrl();
    renderQrCode(initialUrl);

    // Update QR Button
    if (DOM.updateQrBtn) {
      DOM.updateQrBtn.addEventListener('click', () => {
        SoundFX.playClick();
        const customUrl = DOM.qrUrlInput.value.trim();
        if (customUrl) {
          renderQrCode(customUrl);
          showToast('📱 QR Code updated with custom URL!', 'heal');
          addBattleLog(`📱 QR Code target set to: ${customUrl}`, 'system');
        }
      });
    }

    // Copy Link Button
    if (DOM.copyUrlBtn) {
      DOM.copyUrlBtn.addEventListener('click', () => {
        SoundFX.playClick();
        const urlToCopy = DOM.qrUrlInput.value.trim() || window.location.href;
        navigator.clipboard.writeText(urlToCopy).then(() => {
          showToast('📋 Deployment link copied to clipboard!', 'heal');
        }).catch(() => {
          showToast('📋 Link: ' + urlToCopy, 'heal');
        });
      });
    }

    // Reset to Current Address
    if (DOM.resetUrlBtn) {
      DOM.resetUrlBtn.addEventListener('click', () => {
        SoundFX.playClick();
        const currentUrl = window.location.href;
        renderQrCode(currentUrl);
        showToast('🔄 QR Code reset to current browser address.', 'heal');
      });
    }
  }

  // ========================================================
  // 7. BACKGROUND EMBER PARTICLES SYSTEM
  // ========================================================
  function setupParticles() {
    const canvas = DOM.particlesCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const numParticles = 65;
    const particles = [];

    const emberColors = [
      'rgba(255, 69, 0, ',
      'rgba(255, 120, 0, ',
      'rgba(255, 180, 0, ',
      'rgba(230, 28, 56, '
    ];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.6,
        colorBase: emberColors[Math.floor(Math.random() * emberColors.length)],
        alpha: Math.random() * 0.7 + 0.2,
        speedY: Math.random() * 0.8 + 0.3,
        speedX: (Math.random() - 0.5) * 0.5,
        swingAngle: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.02 + 0.01
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];

        p.swingAngle += p.swingSpeed;
        p.x += p.speedX + Math.sin(p.swingAngle) * 0.4;
        p.y -= p.speedY;

        // Flicker alpha
        const currentAlpha = Math.max(0.1, Math.min(0.9, p.alpha + Math.sin(p.swingAngle * 2) * 0.15));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorBase}${currentAlpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ff6a00';
        ctx.fill();

        // Respawn when top reached
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
      }

      requestAnimationFrame(animateParticles);
    }

    requestAnimationFrame(animateParticles);
  }

  // ========================================================
  // 8. FIRE BREATH CANVAS BURST EFFECT
  // ========================================================
  function triggerFireParticlesBurst() {
    const canvas = DOM.fireFxCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const count = 90;

    // Origin: center or bottom-left depending on screen
    const originX = window.innerWidth * 0.5;
    const originY = window.innerHeight * 0.5;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 16 + 8,
        color: Math.random() > 0.4 ? '#ff3700' : (Math.random() > 0.5 ? '#ffaa00' : '#ffe600'),
        alpha: 1,
        life: 1,
        decay: Math.random() * 0.03 + 0.02
      });
    }

    function renderFireBurst() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.life > 0) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.95;
          p.vy *= 0.95;
          p.life -= p.decay;
          p.size *= 0.96;

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 20;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.restore();
        }
      }

      if (alive) {
        requestAnimationFrame(renderFireBurst);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    requestAnimationFrame(renderFireBurst);
  }

  // ========================================================
  // 9. EVENT LISTENERS INITIALIZATION
  // ========================================================
  function setupEventListeners() {
    // SFX Master Toggle
    if (DOM.sfxToggleBtn) {
      DOM.sfxToggleBtn.addEventListener('click', () => {
        getAudioContext();
        gameState.sfxEnabled = !gameState.sfxEnabled;
        if (gameState.sfxEnabled) {
          DOM.sfxIcon.textContent = '🔊';
          DOM.sfxLabel.textContent = 'SFX: ON';
          SoundFX.playClick();
          showToast('🔊 Sound FX enabled.', 'heal');
        } else {
          DOM.sfxIcon.textContent = '🔇';
          DOM.sfxLabel.textContent = 'SFX: OFF';
          showToast('🔇 Sound FX muted.', 'damage');
        }
      });
    }

    // Interactive Game Controls
    if (DOM.fireAttackBtn) {
      DOM.fireAttackBtn.addEventListener('click', () => {
        executeFireAttack();
      });
    }

    if (DOM.healDragonBtn) {
      DOM.healDragonBtn.addEventListener('click', () => {
        executeHealDragon();
      });
    }

    if (DOM.resetStatsBtn) {
      DOM.resetStatsBtn.addEventListener('click', () => {
        executeResetStats();
      });
    }

    if (DOM.takeDamageBtn) {
      DOM.takeDamageBtn.addEventListener('click', () => {
        executeSimulateDamage();
      });
    }

    // Clear Log Button
    if (DOM.clearLogBtn) {
      DOM.clearLogBtn.addEventListener('click', () => {
        SoundFX.playClick();
        if (DOM.battleLogContainer) {
          DOM.battleLogContainer.innerHTML = '';
          addBattleLog('📜 Battle chronicles cleared.', 'system');
        }
      });
    }

    // Modal Close Handlers
    if (DOM.closeArModalBtn) {
      DOM.closeArModalBtn.addEventListener('click', () => {
        SoundFX.playClick();
        closeArModal();
      });
    }

    if (DOM.modalGotItBtn) {
      DOM.modalGotItBtn.addEventListener('click', () => {
        SoundFX.playClick();
        closeArModal();
      });
    }

    if (DOM.arModal) {
      DOM.arModal.addEventListener('click', (e) => {
        if (e.target === DOM.arModal) {
          closeArModal();
        }
      });
    }

    // Keyboard Accessibility
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.arModal && DOM.arModal.classList.contains('active')) {
        closeArModal();
      }
    });
  }

  // ========================================================
  // 10. BOOTSTRAP APPLICATION
  // ========================================================
  function init() {
    setupIntroVideo();
    setupModelViewer();
    setupEventListeners();
    setupParticles();
    updateStatsUI();

    // Setup QR code once DOM and libraries are parsed
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupQrCode);
    } else {
      setupQrCode();
    }
  }

  // Kickoff on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
