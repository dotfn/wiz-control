"""
WiZ Control - servidor local
Habla por UDP (puerto 38899) con lamparas WiZ en la red local
y expone una API HTTP simple para controlarlas desde la pagina web.
"""

import json
import socket
import time

from flask import Flask, jsonify, request, send_from_directory

WIZ_PORT = 38899

app = Flask(__name__, static_folder="static", static_url_path="")


def udp_send(ip, payload, timeout=1.5, port=WIZ_PORT):
    """Manda un comando UDP a una lampara puntual y espera su respuesta."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(timeout)
    try:
        sock.sendto(json.dumps(payload).encode(), (ip, port))
        data, _addr = sock.recvfrom(2048)
        return json.loads(data.decode())
    except socket.timeout:
        return None
    finally:
        sock.close()


@app.get("/")
def index():
    return send_from_directory("static", "index.html")


@app.get("/api/discover")
def discover():
    """Manda un broadcast a toda la red y junta quien responda."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.settimeout(2.5)

    msg = json.dumps({"method": "getPilot", "params": {}}).encode()
    found = {}

    try:
        sock.sendto(msg, ("255.255.255.255", WIZ_PORT))
        deadline = time.time() + 2.5
        while time.time() < deadline:
            try:
                data, addr = sock.recvfrom(2048)
            except socket.timeout:
                break
            ip = addr[0]
            if ip in found:
                continue
            try:
                parsed = json.loads(data.decode())
                found[ip] = parsed.get("result", {})
            except Exception:
                found[ip] = {}
    finally:
        sock.close()

    devices = [{"ip": ip, "state": state} for ip, state in found.items()]
    return jsonify(devices)


@app.get("/api/state")
def get_state():
    ip = request.args.get("ip")
    if not ip:
        return jsonify({"error": "falta ip"}), 400

    result = udp_send(ip, {"method": "getPilot", "params": {}})
    if result is None:
        return jsonify({"error": "la lampara no responde"}), 504
    return jsonify(result.get("result", {}))


@app.post("/api/control")
def control():
    body = request.get_json(force=True, silent=True) or {}
    ip = body.get("ip")
    if not ip:
        return jsonify({"error": "falta ip"}), 400

    params = {}

    if "state" in body:
        params["state"] = bool(body["state"])
    if "dimming" in body:
        params["dimming"] = max(10, min(100, int(body["dimming"])))
    if "temp" in body:
        params["temp"] = max(2200, min(6500, int(body["temp"])))
    if all(k in body for k in ("r", "g", "b")):
        params["r"] = max(0, min(255, int(body["r"])))
        params["g"] = max(0, min(255, int(body["g"])))
        params["b"] = max(0, min(255, int(body["b"])))

    if not params:
        return jsonify({"error": "no hay nada para cambiar"}), 400

    result = udp_send(ip, {"method": "setPilot", "params": params})
    if result is None:
        return jsonify({"error": "la lampara no responde"}), 504
    return jsonify(result)


if __name__ == "__main__":
    print("\nWiZ Control corriendo en http://localhost:5001\n")
    app.run(host="0.0.0.0", port=5001, debug=False)
