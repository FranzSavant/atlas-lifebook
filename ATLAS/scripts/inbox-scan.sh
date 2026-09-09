#!/bin/bash
# inbox-scan.sh — Escanea el Inbox y clasifica cada archivo nuevo con semántica.
#
# El GTD real empieza en la captura: todo lo que aparece en Inbox/ sin procesar
# es "material bruto". Este script:
#   1. listo los archivos sin procesar (más recientes que el último scan)
#   2. clasifica cada uno al dominio correcto (semántica: ¿Salud? ¿Finanzas?...)
#   3. imprime el plan de ruteo: dominio + tipo sugerido
#
# Uso:
#   bash ATLAS/scripts/inbox-scan.sh           → reporte de lo pendiente
#   bash ATLAS/scripts/inbox-scan.sh --all     → incluye ya procesados
# Salida: por item → [puntaje] dominio → sugerencia de acción
set -e
cd "$(dirname "$0")/../.."   # raíz del vault
VAULT_ROOT="$(pwd)"
INBOX="$VAULT_ROOT/Inbox"
LAST_SCAN="$VAULT_ROOT/ATLAS/scripts/.inbox-last"
mkdir -p "$INBOX"

[ -f "$LAST_SCAN" ] || echo "1970-01-01" > "$LAST_SCAN"

echo "=== Inbox scan: $(date '+%Y-%m-%d %H:%M') ==="
echo ""

# archivos nuevos en Inbox/
LAST_DATE=$(cat "$LAST_SCAN")
mapfile -t FILES < <(find "$INBOX" -maxdepth 1 -type f \( -name "*.md" -o -name "*.txt" \) ! -name "INBOX.md" -newermt "$LAST_DATE" 2>/dev/null | sort)

if [ "${#FILES[@]}" -eq 0 ]; then
  echo "Inbox vacío o sin archivos nuevos. (nada que procesar)"
else
  echo "${#FILES[@]} archivo(s) nuevo(s) en Inbox/:"
  echo ""
  for f in "${FILES[@]}"; do
    echo "── $(basename "$f")"
    # clasificar con la semántica existente: buscar qué dominio encaja
    # (usa la API de embeddings compartida, sin reindexar)
    python - "$f" <<'PYEOF'
import json, math, os, sys, time, urllib.request, re

def cosine(a, b):
    if len(a) != len(b): return 0.0
    return sum(x*y for x,y in zip(a,b)) / (math.sqrt(sum(x*x for x in a))*math.sqrt(sum(y*y for y in b)) or 1)

def query_env_key():
    return os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or ""

def embed_google(text):
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not key: return None
    body = json.dumps({"model":"models/gemini-embedding-001",
                       "content":{"parts":[{"text":text[:5000]}]},
                       "outputDimensionality":768}).encode()
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={key}"
    req = urllib.request.Request(url, data=body, headers={"Content-Type":"application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())["embedding"]["values"]
    except Exception:
        return None

f = sys.argv[1]
try:
    text = open(f, encoding="utf-8").read()
except Exception:
    text = ""
if not text.strip():
    print("   (vacío — solo metadatos?)")
    sys.exit(0)

qv = embed_google(text)
if not qv:
    print("   (sin API key — solo inventario, sin clasificación)")
    sys.exit(0)

# clasificar contra los 15 agentes: buscar sus X.md directamente (no el índice global)
agent_docs = []
for a in ["Axel","Dante","Kai","Elias","Hugo","Damian","Abraham","Nico",
          "Leo","Victor","Liam","Orion"]:
    for grp in ["SER","VINCULO","OBRA"]:
        p = os.path.join(os.getcwd(), grp, a, a + ".md")
        if os.path.exists(p):
            agent_docs.append((a, open(p, encoding="utf-8").read()[:6000]))
# guardianes
for g, gp in [("Ser","SER/SER.md"),("Vinculo","VINCULO/VINCULO.md"),("Obra","OBRA/OBRA.md")]:
    p = os.path.join(os.getcwd(), gp)
    if os.path.exists(p):
        agent_docs.append((g, open(p, encoding="utf-8").read()[:6000]))

if not agent_docs:
    print("   (sin X.md de agentes — estructura incompleta)")
    sys.exit(0)

# chunk simple de cada doc y comparar
def chunks(text, n=1500):
    return [text[i:i+n] for i in range(0, len(text), n)]

all_chunks = []
for aname, adoc in agent_docs:
    for c in chunks(adoc):
        all_chunks.append((aname, c))

# vectorizar (lotes de 50)
texts = [c for _, c in all_chunks]
batch = 50
vecs = []
for i in range(0, len(texts), batch):
    b = texts[i:i+batch]
    body = json.dumps({"requests": [
        {"model":"models/gemini-embedding-001","content":{"parts":[{"text":t}]},"outputDimensionality":768}
        for t in b]}).encode()
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=" + query_env_key()
    req = urllib.request.Request(url, data=body, headers={"Content-Type":"application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.loads(r.read())
    vecs.extend(e["values"] for e in data.get("embeddings", []))
    time.sleep(0.2)

scores = {}
for (aname, _), v in zip(all_chunks, vecs):
    s = cosine(qv, v)
    scores[aname] = max(scores.get(aname, 0), s)
top = sorted(scores.items(), key=lambda x: -x[1])[:3]
print("   agente: " + " | ".join(f"{d} ({s:.2f})" for d, s in top))
print(f"   dominios: " + " · ".join(f"{d} ({s:.2f})" for d, s in top))
PYEOF
  done
fi

echo ""
echo "=== sugerencia de ruteo ==="
echo "Cada item del Inbox es material para que Atlas lo rutee al agente"
echo "del dominio con mayor puntaje (ver 'dominios' arriba) y cree el"
echo "archivo correspondiente en su universo GTD."

# actualizar marca de último scan (solo si fue --all no; siempre al final)
date '+%Y-%m-%d %H:%M:%S' > "$LAST_SCAN"
echo "(scan registrado: $(cat "$LAST_SCAN"))"