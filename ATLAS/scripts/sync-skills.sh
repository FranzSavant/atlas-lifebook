#!/bin/bash
# Sync espejo legible -> Pi project-local (nueva estructura: vault/ATLAS/skills -> vault/.pi/skills)
VAULT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$VAULT/ATLAS/skills"
DST="$VAULT/.pi/skills"
echo "Sync $SRC -> $DST"
mkdir -p "$DST"
if command -v python >/dev/null 2>&1; then
  python "$VAULT/ATLAS/scripts/sync-skills.py"
else
  python3 "$VAULT/ATLAS/scripts/sync-skills.py" 2>/dev/null || python "$VAULT/ATLAS/scripts/sync-skills.py"
fi
echo "Listo. En Pi haz /reload"
