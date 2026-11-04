import * as THREE from 'three';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

const host = document.querySelector('#scene');
const status = document.querySelector('#status');
const speedLabel = document.querySelector('#speed');
const scoreLabel = document.querySelector('#score');
let arMode = false;
let statusTimer;
function announce(message, error = false) {
  status.textContent = message;
  status.classList.toggle('error', error);
  if (arMode) {
    status.classList.add('toast-visible');
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => status.classList.remove('toast-visible'), 2800);
  } else {
    status.classList.remove('toast-visible');
  }
}
const siteUrl = document.querySelector('#site-url');
siteUrl.textContent = location.href;
try {
  const qr = window.qrcode(0, 'M');
  qr.addData(location.href);
  qr.make();
  document.querySelector('#qr-code').src = qr.createDataURL(5, 4);
} catch {
  siteUrl.textContent = `Copy this address: ${location.href}`;
}

const scene = new THREE.Scene();
scene.background = new THREE.Color('#78939a');
const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
camera.position.set(0, 4.4, 8.4);
camera.lookAt(0, 0.2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.xr.enabled = true;
host.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xe8f8ff, 0x47533f, 2.2));
const sunlight = new THREE.DirectionalLight(0xfff0cd, 3.2);
sunlight.position.set(-3, 9, 5);
sunlight.castShadow = true;
scene.add(sunlight);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 120), new THREE.MeshStandardMaterial({ color: 0x849075, roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.03;
ground.receiveShadow = true;
scene.add(ground);

const road = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 120), new THREE.MeshStandardMaterial({ color: 0x303941, roughness: 0.95 }));
road.rotation.x = -Math.PI / 2;
road.position.y = 0;
road.receiveShadow = true;
scene.add(road);

const roadside = [];
for (const x of [-2.68, 2.68]) {
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 120), new THREE.MeshBasicMaterial({ color: 0xf5d879 }));
  line.position.set(x, 0.02, 0);
  scene.add(line);
}
const dashes = [];
for (let z = -54; z < 60; z += 5) {
  const dash = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 2.2), new THREE.MeshBasicMaterial({ color: 0xffe6a6 }));
  dash.position.set(0, 0.025, z);
  scene.add(dash);
  dashes.push(dash);
}

const treeMaterials = [0x708657, 0x91a169, 0x5b784f].map(color => new THREE.MeshStandardMaterial({ color, roughness: 1 }));
for (const side of [-1, 1]) {
  for (let i = 0; i < 18; i++) {
    const z = -55 + i * 6.5;
    const x = side * (4.1 + (i % 3) * 1.4);
    const height = 0.45 + (i % 4) * 0.12;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, height, 7), new THREE.MeshStandardMaterial({ color: 0x594738 }));
    trunk.position.set(x, height / 2, z);
    trunk.castShadow = true;
    scene.add(trunk);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.48 + (i % 3) * 0.12, 1), treeMaterials[i % treeMaterials.length]);
    crown.position.set(x, height + 0.28, z);
    crown.castShadow = true;
    scene.add(crown);
    roadside.push(trunk, crown);
  }
}

const car = new THREE.Group();
scene.add(car);
const paint = new THREE.MeshStandardMaterial({ color: 0x37d9a1, metalness: 0.22, roughness: 0.28 });
const dark = new THREE.MeshStandardMaterial({ color: 0x17252c, roughness: 0.36 });
const glass = new THREE.MeshStandardMaterial({ color: 0xa5e5ed, metalness: 0.12, roughness: 0.22 });
const chrome = new THREE.MeshStandardMaterial({ color: 0xd8e7dc, metalness: 0.7, roughness: 0.25 });
const lamp = new THREE.MeshStandardMaterial({ color: 0xfff1a6, emissive: 0xffc54d, emissiveIntensity: 1.3 });
const tailLamp = new THREE.MeshStandardMaterial({ color: 0xff483f, emissive: 0xb51513, emissiveIntensity: 0.8 });

function box(parent, size, material, position) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

box(car, [1.34, 0.42, 2.15], paint, [0, 0.43, 0]);
box(car, [1.12, 0.12, 0.62], paint, [0, 0.69, -0.66]);
box(car, [0.94, 0.42, 1.02], glass, [0, 0.83, 0.02]);
box(car, [1.42, 0.14, 0.18], dark, [0, 0.36, -1.06]);
box(car, [1.42, 0.14, 0.18], dark, [0, 0.36, 1.06]);
box(car, [1.48, 0.08, 0.12], chrome, [0, 0.48, -1.09]);
for (const x of [-0.5, 0.5]) {
  box(car, [0.23, 0.12, 0.07], lamp, [x, 0.57, -1.1]);
  box(car, [0.2, 0.12, 0.07], tailLamp, [x, 0.55, 1.1]);
}
for (const x of [-0.72, 0.72]) {
  for (const z of [-0.7, 0.7]) {
    const wheel = new THREE.Group();
    wheel.position.set(x, 0.26, z);
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.16, 20), dark);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheel.add(tire);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.17, 12), chrome);
    rim.rotation.z = Math.PI / 2;
    wheel.add(rim);
    car.add(wheel);
  }
}
box(car, [0.13, 0.16, 0.07], dark, [-0.42, 0.59, 0.72]);
box(car, [0.13, 0.16, 0.07], dark, [0.42, 0.59, 0.72]);
car.position.set(0, 0, 1.5);

const coins = [];
const coinGold = new THREE.MeshStandardMaterial({ color: 0xffd058, metalness: 0.65, roughness: 0.22, emissive: 0x704500, emissiveIntensity: 0.3 });
for (let i = 0; i < 9; i++) {
  const coin = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.075, 10, 24), coinGold);
  ring.rotation.y = Math.PI / 2;
  coin.add(ring);
  const center = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 12), coinGold);
  coin.add(center);
  coin.position.set([-1.45, 0, 1.45][i % 3], 0.85, -7 - Math.floor(i / 3) * 12);
  coin.castShadow = true;
  scene.add(coin);
  coins.push(coin);
}

const cones = [];
for (let i = 0; i < 7; i++) {
  const cone = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.28, 0.08, 10), dark);
  base.position.y = 0.04;
  cone.add(base);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.19, 0.5, 10), new THREE.MeshStandardMaterial({ color: 0xff813c, roughness: 0.55 }));
  body.position.y = 0.32;
  body.castShadow = true;
  cone.add(body);
  cone.position.set(i % 2 ? 1.8 : -1.8, 0, -15 - i * 13);
  scene.add(cone);
  cones.push(cone);
}

function createTrafficCar(color) {
  const trafficCar = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.4, 1.9), new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.34 }));
  body.position.y = 0.4;
  body.castShadow = true;
  trafficCar.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.42, 0.9), new THREE.MeshStandardMaterial({ color: 0xa8d8e2, metalness: 0.12, roughness: 0.25 }));
  cabin.position.set(0, 0.78, 0.02);
  trafficCar.add(cabin);
  for (const x of [-0.63, 0.63]) for (const z of [-0.58, 0.58]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.14, 14), dark);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.22, z);
    trafficCar.add(wheel);
  }
  return trafficCar;
}

const trafficCars = [0xff765d, 0x5786ee, 0xffcc4e].map((color, i) => {
  const trafficCar = createTrafficCar(color);
  trafficCar.position.set([-1.4, 1.4, 0][i], 0, -20 - i * 17);
  scene.add(trafficCar);
  return trafficCar;
});

let steering = 0;
let throttle = 0;
let score = 0;
let carAnchored = false;
let hitTestSource = null;
let currentHitPose = null;
const clock = new THREE.Clock();

function resize() {
  const rect = host.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / Math.max(rect.height, 1);
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);
resize();

const reticle = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.17, 32), new THREE.MeshBasicMaterial({ color: 0x96f0c0, side: THREE.DoubleSide }));
reticle.matrixAutoUpdate = false;
reticle.visible = false;
scene.add(reticle);

renderer.xr.addEventListener('sessionstart', async () => {
  arMode = true;
  carAnchored = false;
  scene.background = null;
  document.body.classList.add('xr-active');
  hitTestSource = null;
  currentHitPose = null;
  car.visible = true;
  coins.forEach(coin => { coin.visible = false; });
  cones.forEach(cone => { cone.visible = false; });
  trafficCars.forEach(trafficCar => { trafficCar.visible = false; });
  ground.visible = false;
  road.visible = false;
  dashes.forEach(dash => { dash.visible = false; });
  roadside.forEach(object => { object.visible = false; });
  announce('Car preview is ahead. Scan a surface and tap to place it, or drive now.');
  try {
    const session = renderer.xr.getSession();
    const viewer = await session.requestReferenceSpace('viewer');
    hitTestSource = await session.requestHitTestSource({ space: viewer });
  } catch {
    announce('Car preview is ahead. Surface scan is unavailable; you can still drive.');
  }
});

renderer.xr.addEventListener('sessionend', () => {
  arMode = false;
  carAnchored = false;
  scene.background = new THREE.Color('#78939a');
  document.body.classList.remove('xr-active');
  hitTestSource = null;
  currentHitPose = null;
  reticle.visible = false;
  coins.forEach(coin => { coin.visible = true; });
  cones.forEach(cone => { cone.visible = true; });
  trafficCars.forEach(trafficCar => { trafficCar.visible = true; });
  ground.visible = true;
  road.visible = true;
  dashes.forEach(dash => { dash.visible = true; });
  roadside.forEach(object => { object.visible = true; });
  car.position.set(0, 0, 1.5);
  car.visible = true;
  announce('Hold the up arrow to drive. Collect the gold rings!');
});

const arButton = ARButton.createButton(renderer, { requiredFeatures: ['hit-test'], optionalFeatures: ['dom-overlay'], domOverlay: { root: document.body } });
arButton.classList.add('xr-exit');
document.body.appendChild(arButton);
document.querySelector('#ar').addEventListener('click', () => {
  if (!navigator.xr || !isSecureContext || arButton.disabled) {
    announce('AR needs HTTPS, current Chrome, and an ARCore supported Android phone.', true);
    return;
  }
  arButton.click();
});
document.querySelector('#exit-ar').addEventListener('click', () => renderer.xr.getSession()?.end());

renderer.domElement.addEventListener('click', () => {
  if (!arMode) return;
  if (currentHitPose) {
    const { position, orientation } = currentHitPose.transform;
    car.position.set(position.x, position.y, position.z);
    car.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w);
    carAnchored = true;
    positionARTraffic();
    announce('Car placed. Hold ▲ to drive and use ◀ ▶ to steer.');
  } else if (!carAnchored) {
    carAnchored = true;
    positionARTraffic();
    announce('Car preview locked in place. Hold ▲ to drive and use ◀ ▶ to steer.');
  } else {
    announce('Car placed. Hold ▲ to drive and use ◀ ▶ to steer.');
  }
  car.visible = true;
});

function positionARTraffic() {
  const places = [[1.8, -2.4], [-1.9, -4.3], [1.7, -6.3]];
  trafficCars.forEach((trafficCar, i) => {
    const [x, z] = places[i];
    const offset = new THREE.Vector3(x, 0, z).applyQuaternion(car.quaternion);
    trafficCar.position.copy(car.position).add(offset);
    trafficCar.rotation.y = car.rotation.y;
    trafficCar.visible = true;
  });
  coins.forEach((coin, i) => {
    const offset = new THREE.Vector3(i % 2 ? 1.1 : -1.1, 0.9, -3.2 - i * 1.8).applyQuaternion(car.quaternion);
    coin.position.copy(car.position).add(offset);
    coin.visible = i < 5;
  });
}

function resetCoin(coin) {
  coin.position.x = [-1.45, 0, 1.45][Math.floor(Math.random() * 3)];
  coin.position.z = -58 - Math.random() * 18;
}

renderer.setAnimationLoop((_, frame) => {
  const dt = Math.min(clock.getDelta(), 0.05);
  const activeAR = renderer.xr.isPresenting;
  if (!activeAR) {
    car.rotation.y += steering * dt * 0.65;
    car.position.x = THREE.MathUtils.clamp(car.position.x + steering * dt * throttle * 1.9, -1.75, 1.75);
    dashes.forEach(dash => {
      dash.position.z += throttle * dt * 15;
      if (dash.position.z > 8) dash.position.z -= 110;
    });
    coins.forEach(coin => {
      coin.rotation.y += dt * 1.8;
      coin.position.y = 0.85 + Math.sin(clock.elapsedTime * 2 + coin.position.z) * 0.08;
      coin.position.z += throttle * dt * 15;
      if (coin.position.z > car.position.z - 0.8) {
        if (Math.abs(coin.position.x - car.position.x) < 0.9) {
          score++;
          scoreLabel.textContent = String(score);
        }
        resetCoin(coin);
      }
    });
    cones.forEach(cone => {
      cone.position.z += throttle * dt * 15;
      if (cone.position.z > 8) cone.position.z -= 110;
    });
      trafficCars.forEach(trafficCar => {
        trafficCar.position.z += throttle * dt * 9;
        if (trafficCar.position.z > 8) trafficCar.position.z -= 78;
      });
    camera.position.x += (car.position.x * 0.38 - camera.position.x) * 0.035;
    speedLabel.textContent = String(Math.round(throttle * 80));
  } else {
      if (frame && !carAnchored) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const viewerPose = referenceSpace ? frame.getViewerPose(referenceSpace) : null;
        if (viewerPose) {
          const { position, orientation } = viewerPose.transform;
          const viewerRotation = new THREE.Quaternion(orientation.x, orientation.y, orientation.z, orientation.w);
          const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(viewerRotation);
          forward.y = 0;
          forward.normalize();
          car.position.set(position.x + forward.x * 1.6, Math.max(0, position.y - 1.45), position.z + forward.z * 1.6);
          car.rotation.y = Math.atan2(-forward.x, -forward.z);
        }
      }
    if (car.visible && throttle) {
      car.rotation.y += steering * dt * 0.9;
      car.translateZ(-throttle * dt * 1.35);
    }
    speedLabel.textContent = String(Math.round(throttle * 24));
      if (carAnchored) coins.forEach(coin => {
        if (!coin.visible) return;
        coin.rotation.y += dt * 1.7;
        if (throttle && coin.position.distanceTo(car.position) < 1.05) {
          score++;
          scoreLabel.textContent = String(score);
          coin.visible = false;
        }
      });
    if (frame && hitTestSource) {
      const results = frame.getHitTestResults(hitTestSource);
      if (results.length) {
        currentHitPose = results[0].getPose(renderer.xr.getReferenceSpace());
        reticle.visible = true;
        reticle.matrix.fromArray(currentHitPose.transform.matrix);
      } else {
        currentHitPose = null;
        reticle.visible = false;
      }
    }
  }
  renderer.render(scene, camera);
});

function bindHold(id, update) {
  const button = document.querySelector(id);
  button.addEventListener('pointerdown', event => { event.preventDefault(); button.setPointerCapture(event.pointerId); update(true); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => button.addEventListener(type, () => update(false)));
}
bindHold('#left', down => { steering = down ? -1 : 0; });
bindHold('#right', down => { steering = down ? 1 : 0; });
bindHold('#gas', down => { throttle = down ? 1 : 0; });

let dragX = null;
renderer.domElement.addEventListener('pointerdown', event => { dragX = event.clientX; });
renderer.domElement.addEventListener('pointermove', event => {
  if (dragX !== null && !arMode) {
    steering = THREE.MathUtils.clamp((event.clientX - dragX) / 50, -1, 1);
    dragX = event.clientX;
  }
});
renderer.domElement.addEventListener('pointerup', () => { dragX = null; steering = 0; });

document.querySelector('#model').addEventListener('change', event => {
  const file = event.target.files[0];
  if (!file) return;
  new GLTFLoader().load(URL.createObjectURL(file), gltf => {
    car.clear();
    gltf.scene.scale.setScalar(1);
    gltf.scene.position.y = 0;
    car.add(gltf.scene);
    status.textContent = 'Custom model loaded. Drive or place it in AR.';
  }, undefined, () => {
    status.textContent = 'Could not load that model. Choose a valid GLB or glTF file.';
    status.classList.add('error');
  });
});

window.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') steering = -1;
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') steering = 1;
  if (event.key === 'ArrowUp' || event.key === ' ') throttle = 1;
});
window.addEventListener('keyup', event => {
  if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(event.key)) steering = 0;
  if (event.key === 'ArrowUp' || event.key === ' ') throttle = 0;
});
