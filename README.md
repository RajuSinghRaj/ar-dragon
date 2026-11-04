# Mini AR Drive

A small browser driving game with touch steering, a generated 3D car, optional GLB/glTF model loading, and WebXR plane placement.

## Deploy to Vercel

1. Push these project files to a GitHub repository.
2. In Vercel, choose **Add New Project**, import that repository, and deploy with the default static site settings. No build command is needed.
3. Open the deployed HTTPS site on your computer. The **Open on your phone** panel automatically displays a QR code for that exact address.
4. Scan the QR code with your phone. On Android, tap **Place in your room**, scan a flat surface, and tap to place the car.

The Vercel HTTPS address enables WebXR without the local certificate warning. AR placement requires a current Android Chrome browser and an ARCore supported phone. The driving demo works without loading a model; the model picker can load a local `.glb` or `.gltf` file.

## Local preview

Run `python serve.py` to preview on your Wi-Fi. The local preview uses a self-signed certificate; for the deployed site, use the Vercel HTTPS address instead.
