from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from socket import socket, AF_INET, SOCK_DGRAM
from ssl import SSLContext, PROTOCOL_TLS_SERVER
from threading import Thread
from datetime import datetime, timedelta, timezone
import ipaddress
from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID
import qrcode
import mimetypes
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parent

def lan_ip():
    s = socket(AF_INET, SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        return s.getsockname()[0]
    finally:
        s.close()

ip = lan_ip()
base = f"https://{ip}:8443/"
qrcode.make(base).save(ROOT / "phone-qr.png")

key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, ip)])
cert = (x509.CertificateBuilder().subject_name(name).issuer_name(name)
        .public_key(key.public_key()).serial_number(x509.random_serial_number())
        .not_valid_before(datetime.now(timezone.utc) - timedelta(minutes=1))
        .not_valid_after(datetime.now(timezone.utc) + timedelta(days=365))
        .add_extension(x509.SubjectAlternativeName([x509.IPAddress(ipaddress.ip_address(ip))]), critical=False)
        .sign(key, hashes.SHA256()))
(ROOT / "local-cert.pem").write_bytes(cert.public_bytes(serialization.Encoding.PEM))
(ROOT / "local-key.pem").write_bytes(key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))

class AppHandler(BaseHTTPRequestHandler):
    files = {"index.html", "app.js", "style.css"}
    def do_GET(self):
        name = unquote(urlparse(self.path).path).lstrip("/") or "index.html"
        if name not in self.files:
            self.send_error(404)
            return
        data = (ROOT / name).read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", mimetypes.guess_type(name)[0] or "application/octet-stream")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)
    def log_message(self, fmt, *args):
        pass

http = ThreadingHTTPServer(("0.0.0.0", 8000), AppHandler)
https = ThreadingHTTPServer(("0.0.0.0", 8443), AppHandler)
ctx = SSLContext(PROTOCOL_TLS_SERVER)
ctx.load_cert_chain(ROOT / "local-cert.pem", ROOT / "local-key.pem")
https.socket = ctx.wrap_socket(https.socket, server_side=True)
Thread(target=http.serve_forever, daemon=True).start()
print(f"HTTP:  http://{ip}:8000/", flush=True)
print(f"HTTPS: {base} (QR: {ROOT / 'phone-qr.png'})", flush=True)
https.serve_forever()
