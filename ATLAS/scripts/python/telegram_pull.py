#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""telegram_pull.py — Baja mensajes del bot de Telegram al Inbox de Atlas.

El bot es la bandeja de entrada movil: le escribis desde el celular (texto,
links, reenvios desde Facebook/YouTube) y este script los convierte en
archivos de captura dentro de Inbox/Telegram/, listos para el ruteo GTD.

Modos:
  python telegram_pull.py --pull      # bajar mensajes nuevos -> Inbox/Telegram/
  python telegram_pull.py --cleanup   # borrar de Telegram los ya procesados
  python telegram_pull.py --peek URL  # titulo real de un link (oEmbed)

Enlaces se enriquecen para que el LLM "vea de verdad" de que se tratan:
  - YouTube: titulo real via oEmbed (sin API key)
  - Facebook/publico o cualquier web: contenido real via Jina Reader (r.jina.ai)
  - Privado/restringido: se marca para que Atlas pregunte al dueno

Token: variable de entorno TELEGRAM_BOT_TOKEN (no va en ningun archivo).
"""
import json, os, re, sys, time, urllib.parse, urllib.request, urllib.error

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
VAULT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
INBOX_TG = os.path.join(VAULT, "Inbox", "Telegram")
PROCESSED = os.path.join(VAULT, "Inbox", "Procesado")
STATE = os.path.join(os.path.dirname(__file__), ".telegram-offset")

URL_RE = re.compile(r"https?://[^\s\"'<>]+", re.I)

def api(method, params=None):
    """Llamada directa a la Bot API sin librerias."""
    if not TOKEN:
        print("Falta TELEGRAM_BOT_TOKEN (setx TELEGRAM_BOT_TOKEN tu_token)")
        sys.exit(1)
    url = f"https://api.telegram.org/bot{TOKEN}/{method}"
    data = json.dumps(params or {}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        print(f"Telegram API error {e.code}: {e.read()[:200]}")
        sys.exit(1)

def oembed_title(url):
    """Titulo real de un link (YouTube oEmbed, sin API key)."""
    try:
        if "youtube.com" in url or "youtu.be" in url:
            u = "https://www.youtube.com/oembed?url=" + urllib.parse.quote(url, safe="")
            with urllib.request.urlopen(u, timeout=15) as r:
                return json.loads(r.read()).get("title", "")
        if "facebook.com" in url or "fb.watch" in url:
            u = "https://www.facebook.com/plugins/post/oembed.json?url=" + urllib.parse.quote(url, safe="")
            with urllib.request.urlopen(u, timeout=15) as r:
                d = json.loads(r.read())
                return d.get("title") or d.get("author_name") or ""
    except Exception:
        return ""
    return ""

def jina_read(url):
    """Lee el contenido real de una URL via Jina Reader (gratis, sin key).
    Devuelve (ok, texto). ok=False si la pagina es privada/bloqueada."""
    try:
        u = "https://r.jina.ai/" + url
        req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=45) as r:
            content = r.read().decode("utf-8", errors="ignore")
        low = content.lower()
        if len(content.strip()) < 500:
            return False, content[:300]
        return True, content
    except Exception as e:
        return False, str(e)[:150]

def enrich_link(url):
    """Devuelve (title, content) para un link. El LLM ve de verdad.
    Cadena: oEmbed (YouTube) → Jina (web pública) → fb-peek (FB privado con tu sesión)."""
    title = oembed_title(url)
    if title:
        return title, ""
    ok, content = jina_read(url)
    if ok:
        m = re.search(r"Title:\s*(.+)", content)
        t = m.group(1).strip() if m else ""
        cleaned = re.sub(r"\n{3,}", "\n\n", content)[:3000]
        return t, cleaned
    # Facebook privado: usar el perfil Atlas-Agent (sesion del dueno en Chrome)
    if "facebook.com" in url:
        import subprocess
        p = subprocess.run(
            [sys.executable, os.path.join(os.path.dirname(__file__), "fb-peek.py"), url],
            capture_output=True, text=True, timeout=120)
        out = p.stdout.strip()
        if out.startswith("TITLE:"):
            lines = out.splitlines()
            t = lines[0][6:].strip()
            rest = "\n".join(l[5:].strip() for l in lines[1:] if l.startswith("DESC:"))
            return t, rest
        if out.startswith("DELETED"):
            return "", "[ELIMINADO: el contenido ya no existe en Facebook]"
        if out.startswith("LOGIN_REQUIRED"):
            return "", "[FB PRIVADO: logueate una vez con atlas-login.cmd para que el sistema pueda leerlo]"
    return "", "[PRIVADO/RESTRINGIDO: el contenido no es publico - preguntar al dueno que es]"

def safe_name(text, maxlen=60):
    """Nombre de archivo seguro desde el contenido."""
    t = re.sub(r"[^\w\s-]", "", text.lower().strip())
    t = re.sub(r"\s+", " ", t)
    return t[:maxlen] or "mensaje"

def pull():
    os.makedirs(INBOX_TG, exist_ok=True)
    offset = 0
    if os.path.exists(STATE):
        try:
            offset = int(open(STATE).read().strip())
        except Exception:
            offset = 0
    updates = api("getUpdates", {"offset": offset, "timeout": 30, "allowed_updates": ["message"]})
    new_offset = offset
    count = 0
    for upd in updates.get("result", []):
        new_offset = max(new_offset, upd.get("update_id", 0) + 1)
        msg = upd.get("message") or {}
        chat = msg.get("chat", {})
        if chat.get("type") != "private":
            continue
        text = msg.get("text") or msg.get("caption") or ""
        if not text.strip():
            continue
        # enriquecer con titulo/contenido real si es link
        link = URL_RE.search(text)
        title = ""
        link_content = ""
        if link:
            title, link_content = enrich_link(link.group(0))
        fecha = time.strftime("%Y-%m-%d", time.localtime(msg.get("date", time.time())))
        name = safe_name(text.splitlines()[0])
        fname = f"{fecha} - {name} - msg{msg.get('message_id')}.md"
        fpath = os.path.join(INBOX_TG, fname)
        if os.path.exists(fpath):
            continue  # ya bajado
        nl = chr(10)
        body = "---" + nl
        body += "tipo: captura-telegram" + nl
        body += f"id: TG-{msg.get('message_id')}" + nl
        body += f"fecha: {fecha}" + nl
        body += f"telegram_msg_id: {msg.get('message_id')}" + nl
        body += f"telegram_chat_id: {chat.get('id')}" + nl
        body += 'padre: "[[INBOX]]"' + nl
        body += "---" + nl + nl
        body += f"# {text.splitlines()[0][:80]}" + nl + nl + text + nl
        if title:
            body += nl + f"> **Titulo real del link:** {title}" + nl
        if link_content:
            body += nl + "## Contenido visto por el LLM" + nl + nl + link_content + nl
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(body)
        count += 1
        print(f"  + {fname}")
    with open(STATE, "w") as f:
        f.write(str(new_offset))
    return count

def cleanup():
    """Borra de Telegram los mensajes cuyo archivo YA esta procesado."""
    if not os.path.isdir(PROCESSED):
        return 0
    done = 0
    for fn in sorted(os.listdir(PROCESSED)):
        if not fn.endswith(".md"):
            continue
        fp = os.path.join(PROCESSED, fn)
        try:
            txt = open(fp, encoding="utf-8").read()
        except Exception:
            continue
        mid = re.search(r"telegram_msg_id:\s*(\d+)", txt)
        cid = re.search(r"telegram_chat_id:\s*(-?\d+)", txt)
        if not mid or not cid:
            continue
        r = api("deleteMessage", {"chat_id": int(cid.group(1)), "message_id": int(mid.group(1))})
        if r.get("ok"):
            done += 1
            print(f"  - borrado de Telegram: {fn}")
    return done

if __name__ == "__main__":
    args = sys.argv[1:]
    if args and args[0] == "--pull":
        n = pull()
        print(f"Telegram: {n} mensaje(s) nuevo(s) -> Inbox/Telegram/")
    elif args and args[0] == "--cleanup":
        n = cleanup()
        print(f"Telegram: {n} mensaje(s) procesado(s) borrado(s) del chat")
    elif args and args[0] == "--peek":
        print(oembed_title(args[1]) or "(sin titulo)")
    else:
        print(__doc__)