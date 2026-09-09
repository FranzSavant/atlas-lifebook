#!/bin/bash
# publish-public.sh — Publica SOLO la marca blanca (plantilla) al repo público.
# Nunca publica: *-Statement.md, contenido personal GTD, notas privadas.
# Uso:  bash ATLAS/scripts/publish-public.sh "mensaje de la mejora"
set -e
cd "$(dirname "$0")/../.."   # raíz del vault privado

if [ -z "$1" ]; then
  echo "Uso: bash ATLAS/scripts/publish-public.sh \"mensaje\""
  exit 1
fi
MSG="$1"
PUBLIC_DIR="${PUBLIC_DIR:-C:/Users/usuario/Desktop/atlas-lifebook-public}"

if [ ! -d "$PUBLIC_DIR/.git" ]; then
  echo "ERROR: no existe el clone público en $PUBLIC_DIR"
  echo "Clónalo una vez: git clone https://github.com/FranzSavant/atlas-lifebook.git $PUBLIC_DIR"
  exit 1
fi

# ===== MANIFEST: solo rutas publicables (plantilla) =====
# (agregar aquí cualquier archivo nuevo que quieras publicar)
MANIFEST=(
  "README.md"
  "LICENSE"
  "AGENTS.md"
  "ATLAS/ATLAS.md"
  "ATLAS/SYSTEM.md"
  "ATLAS/PLAN.md"
  "ATLAS/scripts"
  "ATLAS/prompts"
  "ATLAS/skills"
  "ATLAS/GTD"
  "ATLAS/tools"
  "ATLAS/mcp"
  "SER/SER.md"
  "SER/Axel/Axel.md"
  "SER/Dante/Dante.md"
  "SER/Kai/Kai.md"
  "SER/Elias/Elias.md"
  "SER/Axel/Axel-GTD"
  "SER/Dante/Dante-GTD"
  "SER/Kai/Kai-GTD"
  "SER/Elias/Elias-GTD"
  "VINCULO/VINCULO.md"
  "VINCULO/Hugo/Hugo.md"
  "VINCULO/Damian/Damian.md"
  "VINCULO/Abraham/Abraham.md"
  "VINCULO/Nico/Nico.md"
  "VINCULO/Hugo/Hugo-GTD"
  "VINCULO/Damian/Damian-GTD"
  "VINCULO/Abraham/Abraham-GTD"
  "VINCULO/Nico/Nico-GTD"
  "OBRA/OBRA.md"
  "OBRA/Leo/Leo.md"
  "OBRA/Victor/Victor.md"
  "OBRA/Liam/Liam.md"
  "OBRA/Orion/Orion.md"
  "OBRA/Leo/Leo-GTD"
  "OBRA/Victor/Victor-GTD"
  "OBRA/Liam/Liam-GTD"
  "OBRA/Orion/Orion-GTD"
)

echo "=== Publicando marca blanca → $PUBLIC_DIR ==="
cd "$PUBLIC_DIR"
git pull -q origin main 2>/dev/null || echo "  (pull sin cambios)"

# Copiar solo lo del manifest (recursivo para carpetas, archivo para .md)
cd "C:/Users/usuario/Desktop/Atlas"
for item in "${MANIFEST[@]}"; do
  if [ -d "$item" ]; then
    # copia recursiva; elimina Statement y contenido personal dentro de GTD
    mkdir -p "$PUBLIC_DIR/$item"
    (cd "$item" && find . -type f | grep -v -- "-Statement.md" | grep -v "/logs/" | grep -v "/Algún día/\|/Referencia/\|/Papelera/\|/Incubar/\|/Proyectos/\|/Próximas acciones/\|/Calendario/\|/Flash/\|/Delegadas/" | while read -r f; do
      mkdir -p "$PUBLIC_DIR/$item/$(dirname "$f")"
      cp "$f" "$PUBLIC_DIR/$item/$f"
    done)
  elif [ -f "$item" ]; then
    mkdir -p "$PUBLIC_DIR/$(dirname "$item")"
    cp "$item" "$PUBLIC_DIR/$item"
  else
    echo "  ⚠ no existe (local): $item"
  fi
done

# Los .md de identidad de los 12 (el loop de carpetas -GTD no los copia)
for spec in "SER/Axel" "SER/Dante" "SER/Kai" "SER/Elias" "VINCULO/Hugo" "VINCULO/Damian" "VINCULO/Abraham" "VINCULO/Nico" "OBRA/Leo" "OBRA/Victor" "OBRA/Liam" "OBRA/Orion"; do
  name=$(basename "$spec")
  cp "$spec/$name.md" "$PUBLIC_DIR/$spec/$name.md" 2>/dev/null || echo "  ⚠ falta $spec/$name.md"
  # sanitizar copia pública: quitar toda referencia al Statement privado
  python - "$PUBLIC_DIR/$spec/$name.md" <<'PYEOF'
import sys, re
p = sys.argv[1]
with open(p, encoding="utf-8") as f:
    t = f.read()
# quitar línea "Lee [[X-Statement]]" y la coma del link en contiene:
t = re.sub(r"\n*> Lee \*\*\[\[[A-Za-z]+-Statement\]\]\*\*[^\n]*", "", t)
t = re.sub(r", \[\[[A-Za-z]+-Statement\]\]", "", t)
with open(p, "w", encoding="utf-8") as f:
    f.write(t)
PYEOF
done

# roles Maestri (config de agentes, sin Statement por diseño)
if [ -d "$PUBLIC_DIR/.maestri" ]; then
  rm -rf "$PUBLIC_DIR/.maestri/roles"
  cp -r "C:/Users/usuario/Desktop/Atlas/.maestri/roles" "$PUBLIC_DIR/.maestri/roles" 2>/dev/null || echo "  ⚠ sin roles"
fi

cd "$PUBLIC_DIR"
git add -A
if git diff --cached --quiet; then
  echo "  Sin cambios de plantilla — nada que publicar."
else
  git commit -q -m "$MSG"
  git push -q origin main && echo "  Push OK → atlas-lifebook (público)"
fi
echo "=== Publicación lista ==="