#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""reel_transcribe.py — Descarga y transcribe el audio de un reel de Facebook.

Flujo completo (para links DIRECTOS de reel):
  1. yt-dlp con cookies del perfil AtlasAgent (sesión del dueño en Chrome)
     → descarga el audio
  2. Gemini (gemini-3.6-flash) transcribe el audio → receta/texto completo

Uso:
  python reel_transcribe.py URL [--full]   → imprime la transcripción

Prerequisito: el dueño se logueó una vez en FB con atlas-login.cmd
(perfil AtlasAgent). Chrome de ese perfil debe estar CERRADO al correr.
"""
import base64, json, os, subprocess, sys, tempfile, urllib.request

CHROME_PROFILE = os.path.expandvars("%LOCALAPPDATA%/Google/Chrome/User Data/AtlasAgent")

def transcribe(url, full=False):
    tmp = tempfile.mkdtemp(prefix="reel-")
    audio = os.path.join(tmp, "receta.m4a")
    # 1. descargar audio con yt-dlp usando las cookies del perfil
    cmd = [
        sys.executable, "-m", "yt_dlp",
        "--cookies-from-browser", "chrome:" + CHROME_PROFILE,
        "-f", "bestaudio/best", "--no-playlist", "--max-filesize", "200M",
        "-o", audio, url,
    ]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if not os.path.exists(audio):
        return f"ERROR_DESCARGANDO: {r.stdout[-300:]} {r.stderr[-200:]}"
    # 2. transcribir con Gemini
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not key:
        return "ERROR: falta GEMINI_API_KEY"
    b64 = base64.b64encode(open(audio, "rb").read()).decode()
    body = json.dumps({
        "contents": [{"parts": [
            {"text": "Transcribí este audio de cocina COMPLETO en español (traducí si está en inglés): nombre de la receta, ingredientes con cantidades, y pasos de preparación. Organizá por recetas si el video muestra varias."},
            {"inline_data": {"mime_type": "audio/mp4", "data": b64}},
        ]}],
        "generationConfig": {"maxOutputTokens": 8192},
    }).encode()
    url_api = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={key}"
    req = urllib.request.Request(url_api, data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=400) as resp:
        d = json.loads(resp.read())
    parts = d.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    text = "".join(p.get("text", "") for p in parts)
    # limpiar prefijo de la IA
    i = text.find("# RECETA")
    if i > 0:
        text = text[i:]
    return text or "ERROR: transcripción vacía"

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else ""
    if not url:
        print("Uso: python reel_transcribe.py URL")
        sys.exit(1)
    print(transcribe(url))