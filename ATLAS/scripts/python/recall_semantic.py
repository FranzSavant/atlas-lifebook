#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""recall_semantic.py — Búsqueda semántica sobre Atlas (notas + sesiones).

Usa gemini-embedding-001 (Google, free tier, batch) con fallback automático a
gemini-embedding-2 vía OpenRouter si Google da 429.

Uso:
  python recall_semantic.py --index                # incremental (solo lo que cambió)
  python recall_semantic.py --full                 # reconstruir TODO desde cero
  python recall_semantic.py --search "pregunta" [n]# buscar (default top 5)
  python recall_semantic.py --index --quick        # solo notas (prueba rápida)

Variables de entorno: GEMINI_API_KEY (y OPENROUTER_API_KEY para fallback).
Índice guardado en ATLAS/vector/ (va al backup privado, jamás al público).
"""
import json, math, os, re, sys, time, urllib.request, urllib.error

VAULT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
VECTOR_DIR = os.path.join(VAULT, "ATLAS", "vector")
INDEX_PATH = os.path.join(VECTOR_DIR, "index.json")
MANIFEST_PATH = os.path.join(VECTOR_DIR, "manifest.json")

CHUNK_CHARS = 2000          # ~500 tokens
OVERLAP = 200               # ~10% solape
BATCH = 50                  # tamaño de lote Google batchEmbedContents
MAX_RETRY = 3
GOOGLE_MODEL = "gemini-embedding-001"
OR_MODEL = "google/gemini-embedding-2"

def log(*a):
    print(*a, flush=True)

# ---------- fuentes ----------

def read_sources(quick=False):
    """Devuelve lista de (fuente, texto). quick = solo notas."""
    srcs = []
    # notas .md
    for root, _, files in os.walk(VAULT):
        rel_root = os.path.relpath(root, VAULT)
        if any(part.startswith(".") for part in rel_root.split(os.sep)):
            continue
        if rel_root in (".sessions", ".git", "node_modules", "ATLAS", "vector"):
            if rel_root == "ATLAS":
                # permitir ATLAS/SYSTEM.md y ATLAS/scripts? solo top-level ATLAS.md
                if not files or not any(f.endswith(".md") for f in files):
                    pass
        for fn in files:
            if not fn.endswith(".md"):
                continue
            p = os.path.join(root, fn)
            if ".sessions" in p or ".git" in p or "node_modules" in p:
                continue
            try:
                with open(p, encoding="utf-8") as f:
                    srcs.append((os.path.relpath(p, VAULT).replace(os.sep, "/"), f.read()))
            except Exception:
                pass
    if quick:
        return srcs
    # sesiones .jsonl (solo Atlas principal + roles, texto de mensajes)
    sdir = os.path.join(VAULT, ".sessions")
    if os.path.isdir(sdir):
        seen = set()
        for name in sorted(os.listdir(sdir)):
            agent_dir = os.path.join(sdir, name)
            if not os.path.isdir(agent_dir):
                continue
            for fn in sorted(os.listdir(agent_dir)):
                if not fn.endswith(".jsonl"):
                    continue
                p = os.path.join(agent_dir, fn)
                fecha = fn.split("T")[0] if "T" in fn else fn[:10]
                # src unico por archivo (dos archivos del mismo agente/fecha colisionan)
                base = "Sesi" + chr(243) + "n " + name + " " + fecha
                src = base if base not in seen else base + " [" + fn + "]"
                seen.add(src)
                try:
                    with open(p, encoding="utf-8", errors="ignore") as f:
                        text_parts = []
                        for line in f:
                            try:
                                o = json.loads(line)
                            except Exception:
                                continue
                            if o.get("type") != "message":
                                continue
                            role = o.get("message", {}).get("role", "?")
                            content = o.get("message", {}).get("content", [])
                            txts = [c.get("text", "") for c in content if isinstance(c, dict) and c.get("type") == "text"]
                            t = " ".join(txts).strip()
                            if t:
                                text_parts.append(f"[{role}] {t}")
                        if text_parts:
                            srcs.append((src, chr(10).join(text_parts)))
                except Exception:
                    pass
    return srcs

def chunk_text(text):
    """Divide en trozos de ~CHUNK_CHARS con solape."""
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= CHUNK_CHARS:
        return [text] if text else []
    chunks = []
    i = 0
    while i < len(text):
        chunks.append(text[i:i + CHUNK_CHARS])
        if i + CHUNK_CHARS >= len(text):
            break
        i += CHUNK_CHARS - OVERLAP
    return chunks

# ---------- embeddings ----------

def embed_google(texts):
    """Batch embeddings vía Google. Devuelve lista de vectores."""
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not key:
        raise RuntimeError("Falta GEMINI_API_KEY")
    out = []
    for i in range(0, len(texts), BATCH):
        batch = texts[i:i + BATCH]
        body = json.dumps({"requests": [
            {"model": f"models/{GOOGLE_MODEL}", "content": {"parts": [{"text": t}]}, "outputDimensionality": 768}
            for t in batch
        ]}).encode()
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{GOOGLE_MODEL}:batchEmbedContents?key={key}"
        req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
        for attempt in range(MAX_RETRY):
            try:
                with urllib.request.urlopen(req, timeout=60) as r:
                    data = json.loads(r.read())
                out.extend(e["values"] for e in data.get("embeddings", []))
                break
            except urllib.error.HTTPError as e:
                if e.code == 429 and attempt < MAX_RETRY - 1:
                    wait = 5 * (attempt + 1)
                    log(f"  [google 429] esperando {wait}s...")
                    time.sleep(wait)
                else:
                    raise
        time.sleep(0.2)
    return out

def embed_openrouter(texts):
    """Embeddings vía OpenRouter (array input en una sola llamada)."""
    key = os.environ.get("OPENROUTER_API_KEY")
    if not key:
        raise RuntimeError("Falta OPENROUTER_API_KEY")
    body = json.dumps({"model": OR_MODEL, "input": texts, "dimensions": 768}).encode()
    url = "https://openrouter.ai/api/v1/embeddings"
    req = urllib.request.Request(url, data=body, headers={
        "Content-Type": "application/json", "Authorization": f"Bearer {key}"})
    for attempt in range(MAX_RETRY):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                data = json.loads(r.read())
            rows = sorted(data.get("data", []), key=lambda x: x.get("index", 0))
            return [row["embedding"] for row in rows]
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and attempt < MAX_RETRY - 1:
                wait = 5 * (attempt + 1)
                log(f"  [openrouter {e.code}] esperando {wait}s...")
                time.sleep(wait)
            else:
                raise

def embed(texts, provider=None):
    provider = provider or os.environ.get("EMBED_PROVIDER", "google")
    if provider == "openrouter":
        return embed_openrouter(texts)
    try:
        return embed_google(texts)
    except urllib.error.HTTPError as e:
        if e.code == 429:
            log("Google agotado (429 persistente) → fallback OpenRouter")
            os.environ["EMBED_PROVIDER"] = "openrouter"
            return embed_openrouter(texts)
        raise

# ---------- index ----------

def hash_text(text):
    import hashlib
    return hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()[:16]

def build_index(quick=False, full=False):
    os.makedirs(VECTOR_DIR, exist_ok=True)
    srcs = read_sources(quick=quick)
    log(f"Fuentes: {len(srcs)}")

    # estado previo
    old_items, old_manifest = [], {}
    if os.path.exists(INDEX_PATH) and not full:
        try:
            with open(INDEX_PATH, encoding="utf-8") as f:
                old_items = json.load(f).get("items", [])
            with open(MANIFEST_PATH, encoding="utf-8") as f:
                old_manifest = json.load(f)
        except Exception:
            old_items, old_manifest = [], {}

    mode = "COMPLETO" if full or not old_items else "incremental"
    log(f"Modo: {mode}")

    new_manifest, keep_items, todo = {}, [], []
    for src, text in srcs:
        h = hash_text(text)
        new_manifest[src] = h
        if not full and h == old_manifest.get(src):
            # fuente sin cambios → conservar sus vectores tal cual
            keep_items.extend(it for it in old_items if it["src"] == src)
        else:
            for c in chunk_text(text):
                todo.append({"src": src, "text": c})

    # fuentes que desaparecieron → sus items se descartan (no pasan a keep_items)
    log(f"Chunks: {len(keep_items)} conservados + {len(todo)} a embedear")
    if todo:
        texts = [r["text"] for r in todo]
        log(f"Embeddeando {len(texts)} chunks (lotes de {BATCH})...")
        t0 = time.time()
        vecs = embed(texts)
        log(f"  {len(vecs)} vectores en {time.time()-t0:.0f}s")
        for r, v in zip(todo, vecs):
            if v:
                keep_items.append({"src": r["src"], "text": r["text"], "v": [round(x, 6) for x in v]})

    if not keep_items:
        log("Nada que indexar.")
        return
    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump({"model": GOOGLE_MODEL, "dim": len(keep_items[0]["v"]), "items": keep_items}, f)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(new_manifest, f)
    log(f"Índice guardado: {INDEX_PATH} ({len(keep_items)} items)")

# ---------- search ----------

def cosine(a, b):
    if len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0

def search(query, top_n=5):
    if not os.path.exists(INDEX_PATH):
        log("No hay índice. Corré:  python recall_semantic.py --index")
        return
    with open(INDEX_PATH, encoding="utf-8") as f:
        idx = json.load(f)
    log(f"Buscando en {len(idx['items'])} chunks (índice {idx.get('model','?')}, {idx.get('dim',0)} dims)...")
    qv = embed([query])[0]
    scored = []
    for it in idx["items"]:
        s = cosine(qv, it["v"])
        if s > 0:
            scored.append((s, it["src"], it["text"]))
    scored.sort(reverse=True)
    log("")
    for i, (s, src, txt) in enumerate(scored[:top_n], 1):
        frag = txt[:220].replace("\n", " ")
        log(f"#{i}  [{s:.3f}] {src}")
        log(f"   {frag}...")
        log("")

# ---------- main ----------

if __name__ == "__main__":
    args = sys.argv[1:]
    if args and args[0] in ("--index", "--full"):
        build_index(quick=("--quick" in args), full=(args[0] == "--full"))
    elif args and args[0] == "--search":
        q = args[1] if len(args) > 1 else None
        n = int(args[2]) if len(args) > 2 else 5
        if not q:
            log('Uso: python recall_semantic.py --search "pregunta" [n]')
        else:
            search(q, n)
    else:
        log(__doc__)
