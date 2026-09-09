#!/bin/bash
# backup.sh — Respaldo automático de Atlas a GitHub (repo privado)
# Detecta automáticamente el vault y las sesiones de Pi en cualquier PC.
# Uso:  bash ATLAS/scripts/backup.sh
# Ideal: programado a diario (Task Scheduler de Windows o crontab).
set -e
cd "$(dirname "$0")/../.."   # sube a la raíz del vault
VAULT_ROOT="$(pwd)"
WINPATH=$(cygpath -w "$VAULT_ROOT" 2>/dev/null || echo "$VAULT_ROOT")
SESS_ID=$(echo "$WINPATH" | sed 's/[:\/\\]/-/g')
SESS="$HOME/.pi/agent/sessions"

echo "=== Atlas backup: $(date '+%Y-%m-%d %H:%M') ==="
echo "  Vault: $VAULT_ROOT"

# 0. Respaldar sesiones (charlas vivas) al vault, con nombres legibles
SDEST="$VAULT_ROOT/.sessions"
rm -rf "$SDEST"
mkdir -p "$SDEST"
# sesión principal de Atlas (el cwd del vault)
if [ -d "$SESS/--${SESS_ID}--" ]; then
  cp -r "$SESS/--${SESS_ID}--" "$SDEST/Atlas" 2>/dev/null || true
fi
# sesiones de los roles Maestri (UUID → nombre)
for d in "$SESS"/--${SESS_ID}-.maestri-roles-*/; do
  [ -d "$d" ] || continue
  uuid=$(basename "$d" | sed 's/.*roles-//;s/--$//')
  rj="$VAULT_ROOT/.maestri/roles/$uuid/role.json"
  name=$(grep '"name"' "$rj" 2>/dev/null | head -n 1 | sed 's/.*"name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
  [ -n "$name" ] || name="$uuid"
  cp -r "$d" "$SDEST/$name" 2>/dev/null || true
done
echo "  Sesiones respaldadas: $(find "$SDEST" -name '*.jsonl' | wc -l)"

# 1. Traer lo que haya en el remoto (si el repo tiene historial remoto)
git pull --no-edit --autostash -q origin main 2>/dev/null || echo "  (pull sin cambios o primer backup)"

# 2. Añadir todo lo nuevo
git add -A

# 3. Commitear (si hay cambios)
if git diff --cached --quiet; then
  echo "  Sin cambios — nada que respaldar."
else
  git commit -q -m "backup $(date '+%Y-%m-%d %H:%M')"
  echo "  Commit creado."
fi

# 4. Subir
git push -q origin main && echo "  Push OK → GitHub (privado)."
echo "=== Backup completo ==="