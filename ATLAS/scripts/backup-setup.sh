#!/bin/bash
# backup-setup.sh — Configura el respaldo privado a GitHub (primera vez).
# Guía al dueño del vault para crear un repo privado y conectarlo como
# respaldo automático. No toca el repo público de la plantilla.
# Uso:  bash ATLAS/scripts/backup-setup.sh
set -e
cd "$(dirname "$0")/../.."   # raíz del vault
VAULT_ROOT="$(pwd)"

echo "=== Atlas — Configurar respaldo privado a GitHub ==="
echo ""

# 0. ¿Ya hay backup?
if bash ATLAS/scripts/backup-status.sh >/dev/null 2>&1; then
  echo "Ya hay un respaldo configurado: $(git remote get-url origin)"
  echo "Nada que hacer. Si querés cambiarlo, borrá la línea 'origin' de .git/config"
  exit 0
fi

# 1. Pedir usuario de GitHub
echo "Vas a conectar ESTE vault a un repo PRIVADO en GitHub."
echo "El contenido (tu vida: notas, respuestas, sesiones) quedará respaldado"
echo "allí automáticamente. El repo público de la plantilla NO se toca."
echo ""
read -r -p "Tu usuario de GitHub (sin @): " GH_USER
[ -z "$GH_USER" ] && { echo "Sin usuario, cancelado."; exit 1; }

# 2. Nombre sugerido del repo
REPO="${REPO_NAME:-atlas-backup}"
echo ""
echo "El repo privado se llamará:  $GH_USER/$REPO"
echo ""

# 3. Instrucciones manuales (no se puede crear el repo sin tu login/permisos)
echo "──────────────────────────────────────────────"
echo "   PASO 1 — Creá el repo en GitHub (una vez):"
echo "   1. Andá a  https://github.com/new"
echo "   2. Name:  $REPO"
echo "   3. Seleccioná  PRIVATE  (importante: tu vida es privada)"
echo "   4. NO marques 'Add a README' (dejalo vacío)"
echo "   5. Create repository"
echo ""
echo "   PASO 2 — conectá este vault (te pido la URL cuando esté creado)"
echo "──────────────────────────────────────────────"
echo ""
read -r -p "¿Ya lo creaste? Pegá la URL https del repo (o Enter para cancelar): " GH_URL
if [ -z "$GH_URL" ]; then
  echo "Cancelado. Corré de nuevo cuando tengas el repo creado."
  exit 1
fi

# 4. Conectar
echo ""
echo "Conectando..."
git init -q 2>/dev/null || true
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$GH_URL"
else
  git remote add origin "$GH_URL"
fi

# 5. Branch main + primer commit
git checkout -q -b main 2>/dev/null || git checkout -q main 2>/dev/null || true
git add -A
if ! git diff --cached --quiet; then
  git commit -q -m "backup inicial — $(date '+%Y-%m-%d %H:%M')"
fi

# 6. Push
echo "Primer push (GitHub te puede pedir login — seguí las ventanas)..."
git push -q -u origin main && echo ""
echo "✅ ¡Respaldo configurado! Tu vault ahora está a salvo en GitHub (privado)."
echo "   Se respalda solo cada vez que corras:  bash ATLAS/scripts/backup.sh"
echo "   (y la tarea programada diaria si la configuraste)"