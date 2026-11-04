# AR DRAGON ARENA – Unity-Inspired WebAR Experience

**Summon Your Legend. Enter the Battle.**

A complete, visually impressive, mobile-first Augmented Reality Dragon Game built with HTML5, CSS3, Vanilla JavaScript, and Google Model Viewer.

---

## 🐲 Project Architecture

```
AR-Dragon-Arena/
├── index.html                    # Main HTML5 Arena application & Model Viewer
├── style.css                     # Dark black, fiery magma HUD & glassmorphism styles
├── script.js                     # Combat engine, Web Audio API synthesizer, AR controller
└── assets/
    ├── intro.mp4                 # Cinematic introductory video splash screen
    ├── dragon.glb                # Realistic 3D low-poly dragon model (Inferno)
    ├── model-viewer.min.js       # Google Model Viewer WebAR library
    ├── qrcode.min.js             # Authentic client-side QR Code generator
    └── textures/
        └── low-poly-dragon_palette.png # Dragon color palette texture
```

---

## ⚡ Key Features

1. **Cinematic Opening Splash Screen**:
   - Auto-plays the cinematic `intro.mp4` full-screen on load.
   - Glowing fiery "SKIP INTRO" button and sound toggle.
   - Smooth scale/opacity transition when the video finishes or is skipped.

2. **3D Dragon Summoning Podium (Google Model Viewer)**:
   - Centered 3D rendering of `dragon.glb` with realistic shadows (`shadow-intensity="1.6"`) and lighting (`exposure="1.2"`).
   - Full 360° rotation, tilt, and zoom camera controls.
   - Auto-rotation with pause-on-drag and resume delay.
   - View controls: Auto-Rotate toggle, Reset Camera, and Boost Lighting.

3. **WebAR Experience**:
   - Dedicated **SUMMON DRAGON IN AR** primary action button.
   - Supports **Android Scene Viewer** (via ARCore in Google Chrome) and **Apple Quick Look** (iOS 12+ Safari).
   - Real-world surface detection (`ar-placement="floor"`).
   - Desktop/non-AR fallback: displays the interactive AR Summoning Modal with scannable QR code and step-by-step setup guide.

4. **Dragon Statistics HUD (INFERNO)**:
   - **Dragon Name**: `INFERNO` (Ancient Fire Drake)
   - **Level**: `25`
   - **Element**: `Fire 🔥`
   - **Rarity**: `Legendary ⭐⭐⭐⭐⭐`
   - **Health**: `1000 / 1000 HP` (Animated dynamic progress bar with color shifts)
   - **Attack Power**: `850 / 1000`
   - **Defence**: `720 / 1000`

5. **Interactive Combat Controls**:
   - **🔥 FIRE ATTACK**: Hellfire Breath animation with screen camera shake, fiery particle explosion, dragon roar audio, and battle notification. Deals 850 DMG to the Arena Target!
   - **💚 HEAL DRAGON**: Ingests Phoenix Ash, restoring +100 HP (up to max 1000 HP), accompanied by ascending celestial chime audio, green health aura, and live battle log updates.
   - **🔄 RESET STATS**: Instantly restores default Legendary stats and resets the combat battlefield.
   - **💥 SIMULATE ENEMY HIT**: Inflicts -200 HP on Inferno so you can immediately see the health bar drop, turn amber/red, and test the HEAL button!

6. **Web Audio API Sound Synthesizer**:
   - Zero external audio files required! Pure procedural browser sound generation for dragon roar/flame blast, heal chime, and HUD clicks.
   - Master sound toggle in header (`🔊 SFX: ON` / `🔇 SFX: OFF`).

7. **Dedicated Authentic QR Code Access**:
   - Scannable QR code generated client-side using `qrcode.min.js`.
   - Point your mobile camera to launch the WebAR experience on your smartphone.
   - Configurable deployment URL input with live 1-click QR code re-rendering.

---

## 🚀 How to Run Locally

Because WebAR and 3D Model Viewer load binary GLB files and video, you must serve the files through a local HTTP server (not directly double-clicking `file://`).

### Method 1: Python (Recommended - Built into Windows)
Open PowerShell in this directory:
```powershell
# Navigate to the folder if not already there:
cd c:\Users\rajurajpurohit\Desktop\arvr

# Start a local web server:
python -m http.server 8000
```
Then open your browser to:
👉 **`http://localhost:8000`**

### Method 2: Node.js (npx serve)
```bash
npx serve . -p 8000
```

---

## 📱 How to Test WebAR on Your Phone

WebAR camera access requires a secure connection (**HTTPS**) or your local network connection:

### Option A: Via Local Wi-Fi (Same Network)
1. Run `python -m http.server 8000` on your PC.
2. Find your PC's IP address (e.g., `10.178.11.87` or run `ipconfig`).
3. On your phone, connect to the same Wi-Fi and open:
   `http://<YOUR-PC-IP>:8000`
4. Tap **SUMMON DRAGON IN AR**!

### Option B: Free Instant HTTPS Tunnel with Ngrok
WebAR features (WebXR / Scene Viewer) work best over HTTPS.
1. Download [ngrok](https://ngrok.com/) or run:
   ```bash
   npx ngrok http 8000
   ```
2. Copy the resulting `https://xxxx.ngrok-free.app` URL.
3. Paste that URL into the **WEBSITE HTTPS DEPLOYMENT URL** box on the webpage and click **UPDATE QR**.
4. Scan the QR code with your phone camera!

---

## 🌐 Free 1-Click Deployment (Permanent HTTPS)

### Deploy to Vercel (Fastest):
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory and follow prompts.
3. Your app is live on a free permanent HTTPS link (e.g., `https://ar-dragon-arena.vercel.app`).
4. Update the QR Code section with your new URL!

### Deploy to GitHub Pages:
1. Initialize a git repo and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of AR Dragon Arena"
   git remote add origin https://github.com/<your-username>/ar-dragon-arena.git
   git branch -M main
   git push -u origin main
   ```
2. In your GitHub repository, go to **Settings > Pages**.
3. Under **Branch**, select `main` and `/ (root)`, then click **Save**.
4. Your site will be published at `https://<your-username>.github.io/ar-dragon-arena/` with full WebAR support!
