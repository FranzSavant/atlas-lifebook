#!/bin/bash
# session-search.sh — Busca texto en las sesiones pasadas (respaldo .sessions/).
# Las sesiones se respaldan con backup.sh dentro del vault (carpeta .sessions/),
# así que funciona también tras clonar el repo en otra PC.
# Uso:  bash ATLAS/scripts/session-search.sh "texto a buscar" [agente]
#   sin 2º arg → busca en todas las sesiones
#   "atlas"    → solo tu conversación con Atlas
#   "Axel"     → solo las sesiones del agente Axel
set -e
cd "$(dirname "$0")/../.."   # raíz del vault
VAULT_ROOT="$(pwd)"
WINPATH=$(cygpath -w "$VAULT_ROOT" 2>/dev/null || echo "$VAULT_ROOT")
SESS_ID=$(echo "$WINPATH" | sed 's/[:\/\\]/-/g')
SESS="$HOME/.pi/agent/sessions"
QUERY="$1"
SCOPE="$2"

if [ -z "$QUERY" ]; then
  echo "Uso: bash ATLAS/scripts/session-search.sh \"texto\" [agente|atlas]"
  exit 1
fi

# asegurar respaldo fresco de sesiones antes de buscar
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

echo "=== Buscando \"$QUERY\" en sesiones (scope: ${SCOPE:-todas}) ==="
echo ""

FOUND=0
for d in "$SDEST"/*/; do
  [ -d "$d" ] || continue
  ctx=$(basename "$d")
  [ "$SCOPE" != "atlas" ] && [ "$SCOPE" != "" ] && [ "$ctx" != "$SCOPE" ] && continue
  for f in "$d"/*.jsonl; do
    [ -f "$f" ] || continue
    if grep -q -i "$QUERY" "$f" 2>/dev/null; then
      fecha=$(basename "$f" | cut -d_ -f1 | cut -dT -f1)
      echo "▶ [$ctx] $fecha — $(basename "$f")"
      grep -i "$QUERY" "$f" 2>/dev/null | while IFS= read -r line; do
        role=$(echo "$line" | python -c "import sys,json
try:
  o=json.loads(sys.stdin.read()); print(o.get('message',{}).get('role','?') if o.get('type')=='message' else 'event')
except: print('?')" 2>/dev/null)
        txt=$(echo "$line" | python -c "import sys,json
try:
  o=json.loads(sys.stdin.read()); m=o.get('message',{})
  parts=[c.get('text','') for c in m.get('content',[]) if isinstance(c,dict) and c.get('type')=='text']
  print(' '.join(parts)[:300])
except: print('')" 2>/dev/null)
        if [ -n "$txt" ]; then
          echo "   [$role] $txt"
          FOUND=$((FOUND+1))
        fi
      done
      echo ""
    fi
  done
done

if [ "$FOUND" -eq 0 ]; then
  echo "Sin resultados."
else
  echo "=== $FOUND coincidencias ==="
fi