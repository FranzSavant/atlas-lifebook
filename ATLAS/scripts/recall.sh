#!/bin/bash
# recall.sh — Búsqueda unificada de memoria del agente (notas + sesiones).
# Uso:  bash ATLAS/scripts/recall.sh "palabras clave" [límite]
# Busca EN NOTAS (.md) y EN SESIONES (.sessions/) a la vez y etiqueta cada
# resultado por fuente: NOTA (ruta de archivo) o SESIÓN (fecha + agente).
# Salida:
#   === NOTAS ===
#   [SER/Axel/Axel-Statement.md] línea: extracto...
#   === SESIONES ===
#   [Atlas 2026-09-06] [assistant] extracto...
set -e
cd "$(dirname "$0")/../.."   # raíz del vault
VAULT_ROOT="$(pwd)"
QUERY="$1"
LIMIT="${2:-10}"

if [ -z "$QUERY" ]; then
  echo "Uso: bash ATLAS/scripts/recall.sh \"palabras\" [límite]"
  exit 1
fi

echo "=== NOTAS ==="
# buscar en .md del vault (excluye ocultos, .sessions, node_modules, .maestri, .git, .obsidian, .pi)
MATCHES=0
while IFS= read -r f; do
  [ -f "$f" ] || continue
  rel="${f#./}"
  # extraer líneas que coincidan (case-insensitive), recortadas a ~160 chars
  while IFS= read -r line; do
    [ -n "$line" ] || continue
    echo "[$rel] ${line:0:160}"
    MATCHES=$((MATCHES+1))
    [ "$MATCHES" -ge "$LIMIT" ] && break
  done < <(grep -i -h "$QUERY" "$f" 2>/dev/null | head -n 5)
  [ "$MATCHES" -ge "$LIMIT" ] && break
done < <(find . -name '*.md' -not -path './.sessions/*' -not -path './.git/*' -not -path './node_modules/*' -not -path './.maestri/*' -not -path './.obsidian/*' -not -path './.pi/*' 2>/dev/null | head -n 200)
if [ "$MATCHES" -eq 0 ]; then
  echo "(sin coincidencias en notas)"
fi

echo ""
echo "=== SESIONES ==="
# asegurar respaldo fresco de sesiones
SESS="$HOME/.pi/agent/sessions"
WINPATH=$(cygpath -w "$VAULT_ROOT" 2>/dev/null || echo "$VAULT_ROOT")
SESS_ID=$(echo "$WINPATH" | sed 's/[:\/\\]/-/g')
SDEST="$VAULT_ROOT/.sessions"
mkdir -p "$SDEST"
if [ -d "$SESS/--${SESS_ID}--" ]; then
  cp -r "$SESS/--${SESS_ID}--" "$SDEST/Atlas" 2>/dev/null || true
fi
for d in "$SESS"/--${SESS_ID}-.maestri-roles-*/; do
  [ -d "$d" ] || continue
  uuid=$(basename "$d" | sed 's/.*roles-//;s/--$//')
  rj="$VAULT_ROOT/.maestri/roles/$uuid/role.json"
  name=$(grep '"name"' "$rj" 2>/dev/null | head -n 1 | sed 's/.*"name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
  [ -n "$name" ] || name="$uuid"
  cp -r "$d" "$SDEST/$name" 2>/dev/null || true
done

FOUND=0
for d in "$SDEST"/*/; do
  [ -d "$d" ] || continue
  ctx=$(basename "$d")
  for f in "$d"/*.jsonl; do
    [ -f "$f" ] || continue
    if grep -q -i "$QUERY" "$f" 2>/dev/null; then
      fecha=$(basename "$f" | cut -d_ -f1 | cut -dT -f1)
      # 1 línea de contexto por archivo de sesión
      line=$(grep -i "$QUERY" "$f" 2>/dev/null | head -n 1)
      role=$(echo "$line" | python -c "import sys,json
try:
  o=json.loads(sys.stdin.read()); print(o.get('message',{}).get('role','?') if o.get('type')=='message' else 'event')
except: print('?')" 2>/dev/null)
      txt=$(echo "$line" | python -c "import sys,json
try:
  o=json.loads(sys.stdin.read()); m=o.get('message',{})
  parts=[c.get('text','') for c in m.get('content',[]) if isinstance(c,dict) and c.get('type')=='text']
  print(' '.join(parts)[:200])
except: print('')" 2>/dev/null)
      [ -n "$txt" ] && { echo "[$ctx $fecha] [$role] $txt"; FOUND=$((FOUND+1)); }
    fi
  done
  [ "$FOUND" -ge "$LIMIT" ] && break
done
if [ "$FOUND" -eq 0 ]; then
  echo "(sin coincidencias en sesiones)"
fi
echo ""
echo "=== Fin (notas: $MATCHES · sesiones: $FOUND) ==="