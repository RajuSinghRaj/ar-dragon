# Mini AR Drive

A small mobile driving game with a detailed 3D car, gold ring pickups, road cones, touch steering, optional GLB/glTF model loading, and WebXR plane placement.

## Deploy to Vercel

1. Push the project files to GitHub.
2. Import the repository in Vercel and deploy it as a static site. No build command is needed.
3. Open the deployed HTTPS site on a computer. Its **Open on your phone** panel shows a QR code for that exact address.
4. Scan the QR code. On Android, tap **Place in your room**. The car preview appears right away; once a surface is detected, tap to place it there.

AR requires a current Android Chrome browser and an ARCore supported phone. Hold the up control to drive, steer with the left and right controls, and collect gold rings. The model picker can load a local `.glb` or `.gltf` file. QR generation is bundled with the site and does not depend on an external QR service.

## Local preview

Run `python serve.py` to preview on your Wi-Fi. The local preview uses a self-signed certificate. The deployed Vercel HTTPS address works without the local certificate warning.
