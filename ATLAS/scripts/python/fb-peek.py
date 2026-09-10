#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""fb-peek.py — Lee el contenido REAL de un link de Facebook privado/restringido
usando el perfil de Chrome Atlas-Agent (donde el dueño se logueó una vez).

El perfil vive en disco: sobrevive reinicios. El sistema abre Chrome headless
con ESE perfil (silencioso, sin ventanas), navega al link y extrae:
  - og:title / og:description (lo que Facebook muestra al dueño logueado)
  - el texto del post (primeros N chars)

Uso:
  python fb-peek.py URL   -> imprime TITLE | DESCRIPTION | TEXT (o ERROR)

Perfil: C:/Users/usuario/AppData/Local/Google/Chrome/User Data/AtlasAgent
Login único: doble clic en C:/Users/usuario/Desktop/atlas-login.cmd y loguearse.
"""
import html, re, subprocess, sys, tempfile, os
html_unescape = html.unescape

CHROME = os.environ.get("CHROME_BIN") or "C:/Program Files/Google/Chrome/Application/chrome.exe"
if not os.path.exists(CHROME):
    CHROME = os.path.expandvars("%LOCALAPPDATA%/Google/Chrome/Application/chrome.exe")
    if not os.path.exists(CHROME):
        CHROME = os.path.expandvars("%LOCALAPPDATA%/Microsoft/Edge/Application/msedge.exe")
PROFILE = os.path.expandvars("%LOCALAPPDATA%/Google/Chrome/User Data/AtlasAgent")

def read(url, timeout=50):
    tmp = os.path.join(tempfile.gettempdir(), "fbdom.html")
    cmd = [
        CHROME, "--headless=new", "--disable-gpu", "--no-first-run",
        "--no-default-browser-check", "--disable-extensions",
        f"--user-data-dir={PROFILE}",
        "--dump-dom", url,
    ]
    try:
        with open(tmp, "w", encoding="utf-8", errors="ignore") as f:
            r = subprocess.run(cmd, stdout=f, stderr=subprocess.DEVNULL, timeout=timeout)
        body = open(tmp, encoding="utf-8", errors="ignore").read()
        if not body.strip():
            err = r.stderr.decode("utf-8", errors="ignore")[:200]
            print(f"DBG: dom vacio; stderr={err}", file=sys.stderr)
    except subprocess.TimeoutExpired:
        return "", "", ""
    except Exception as e:
        print(f"DBG: error {e}", file=sys.stderr)
        return "", "", ""
    title = desc = ""
    m = re.search(r'property="og:title"\s+content="([^"]*)"', body)
    if m:
        title = m.group(1)
    m = re.search(r'property="og:description"\s+content="([^"]*)"', body)
    if m:
        desc = m.group(1)
    return title, desc, body

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else ""
    if not url:
        print("Uso: python fb-peek.py URL")
        sys.exit(1)

    title, desc, body = read(url)

    def norm(s):
        return (s or "").lower().replace("í", "i").replace("ó", "o").replace("ú", "u").replace("á", "a").replace("é", "e")

    if title and ("iniciar sesion" in norm(title) or "inicia sesion" in norm(title) or "log into" in norm(title)):
        print("LOGIN_REQUIRED: la sesion del perfil AtlasAgent no tiene acceso (logueate con atlas-login.cmd)")
        sys.exit(0)

    if title and "no esta disponible" in norm(title):
        print("DELETED: el contenido ya no esta disponible (fue eliminado o expiro)")
        sys.exit(0)

    found = []
    m = re.search(r"<title>([^<]{10,300})</title>", body)
    if m:
        t0 = re.sub(r"\| Facebook$", "", html_unescape(m.group(1))).strip()
        if t0 and "facebook" not in t0.lower():
            found.append(t0[:200])
    for t in re.findall(r'"text"\s*:\s*"([^"]{20,500})"', body):
        t2 = re.sub(r"\u00e1|\u00e9|\u00ed|\u00f3|\u00fa|\u00f1", " ", t)
        t2 = re.sub(r"\n", " ", t2)
        low = t2.lower()
        if (t2 not in found and "meta ai" not in low and "condiciones" not in low
                and "marketplace" not in low and "cumplea" not in low
                        and "no esta disponible" not in low
                        and "contrase" not in low and "iniciar sesion" not in low
                        and "foto del perfil" not in low and "clave" not in low
                        and "cubo" not in low and len(t2) > 15):
            found.append(t2[:400])
    if found:
        print(f"TITLE: {found[0]}")
        for extra in found[1:3]:
            print(f"DESC: {extra}")
    elif title and "facebook" not in norm(title):
        print(f"TITLE: {title[:200]}")
    else:
        print("NO_CONTENT: no se pudo extraer contenido (el post puede ser un video que requiere reproduccion)")
