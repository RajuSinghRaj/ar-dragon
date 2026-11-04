# 🐉 Augmented Reality Dragon Tracker (Unity + AR Foundation)

An interactive **Augmented Reality (AR)** project built using **Unity** and **AR Foundation**, where scanning a real-world image spawns a **3D Dragon** that can be controlled using an on-screen **joystick**! Perfect for beginners exploring AR development and mobile-based interaction 🚀

[📺 Demo Video (Made with Unity)](intro.mp4)

![Made with Unity Demo](demo.gif)

---

## ✨ Features

- 📸 **AR Image Tracking** — Scan a real-world image to trigger AR content
- 🐲 **3D Dragon Model** — A stylized dragon spawns over the image
- 🎮 **Joystick Control** — Use a virtual joystick to control dragon movement
- 📱 **Android Support** — Deploys and runs smoothly on Android devices
- ⚡ **Lightweight Build** — Optimized for mobile devices using Unity's LTS version

---

## 🔧 Tech Stack

| Tool            | Description                                 |
|-----------------|---------------------------------------------|
| Unity (2021.3.6 LTS) | Core development engine                    |
| AR Foundation   | Image tracking and AR scene management      |
| ARCore          | Backend engine for Android AR               |
| C#              | Custom scripts for dragon control & logic   |
| Fixed Joystick (Joystick Pack) | Virtual joystick for user input             |
| Game Assets     | 3D Dragon model + Target image              |

---

## 📁 Project Structure

```

AR-Dragon-Tracker/
├── Assets/
│   ├── Dragon/                # 3D model + prefab
│   ├── Scripts/
│   │   ├── PrefabCreator.cs   # Spawns dragon on image detection
│   │   └── DragonController.cs # Handles joystick-based movement
│   ├── UI/
│   │   └── FixedJoystick.prefab
│   └── ImageLibrary/
│       └── GameOfThrones.jpg  # Tracked image
├── AR Session Setup/
│   ├── AR Session Origin
│   └── AR Session

```

---

## 🕹️ Interaction Flow

1. 🖼️ **Scan Image** → The app detects a reference image (e.g., Game of Thrones poster).
2. 🐉 **Dragon Spawns** → A dragon model appears above the image in AR.
3. 🎛️ **Use Joystick** → Move the dragon around using the on-screen joystick.
4. 📐 **Physics & Rotation** → The dragon moves naturally and rotates toward the direction of movement.

---

## 🧠 How It Works

### 🔍 AR Image Tracking
- Unity’s `AR Tracked Image Manager` listens for image detection.
- When the target image is found, it triggers the `PrefabCreator` script.
- The dragon prefab is instantiated with a slight vertical offset.

### 🐉 Dragon Control Logic
- `DragonController` script reads input from the joystick.
- Movement is handled via Unity physics using `Rigidbody`.
- Rotation ensures the dragon faces the direction it’s moving.

### 🛠️ Android Configurations
- ✔️ Switched platform to Android in Build Settings
- ✔️ Enabled ARCore in XR Plugin Management
- ✔️ Set API Level ≥ 24
- ✔️ IL2CPP & ARM64 architecture for performance

---

## 🎯 Use Case

This project is great for:

- 🎓 Learning basic AR development using Unity
- 🧪 Experimenting with mobile AR & 3D object control
- 🛍️ Retail, gaming, or promotional AR experiences

---

## 📦 How to Run

1. Open in Unity 2021.3.6 LTS or later.
2. Add your own tracked image and dragon model (optional).
3. Connect Android device with USB debugging.
4. Switch build platform to Android → Build & Run.

---

## 📚 Credits & Resources

- 🎥 Tutorial Source: [YouTube - Augmented Reality Game](https://www.youtube.com/watch?v=GfS72wqKQ_g)
- 🐉 Dragon 3D Model: Unity Asset Store
- Photo : Unsplash.com (https://unsplash.com/photos/brown-dragon-decor-JvKMMV6fLTA)
- 🎮 Joystick Pack: Unity Asset Store

---

## 🔮 Future Improvements

- ✨ Add animation to the dragon
- 🔊 Integrate sound effects
- 🌍 Expand to markerless tracking
- 📲 Add iOS support via ARKit

---
