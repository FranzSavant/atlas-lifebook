#!/bin/bash
# item-gtd — Crea un nuevo elemento GTD fractal en los 12 universos
# Uso: bash ATLAS/scripts/item-gtd.sh "Nombre" "Parent" [tipo]
# Ej: bash ATLAS/scripts/item-gtd.sh "Revision" "No accionable"
#     bash ATLAS/scripts/item-gtd.sh "Urgente" "Próximas acciones"

NAME="$1"
PARENT="$2"
TIPO="${3:-contenedor-gtd}"

if [ -z "$NAME" ] || [ -z "$PARENT" ]; then
  echo "Uso: $0 \"Nombre\" \"Parent\" [tipo]"
  echo "Ej: $0 \"Revision\" \"No accionable\""
  exit 1
fi

cd "$(dirname "$0")/../.."
    VAULT="$(pwd)"
FECHA=$(date +%Y-%m-%d)

# 12 especialistas con su base
declare -A SPECS=(
  ["SER/Axel"]="Axel"
  ["SER/Dante"]="Dante"
  ["SER/Kai"]="Kai"
  ["SER/Elias"]="Elias"
  ["VINCULO/Hugo"]="Hugo"
  ["VINCULO/Damian"]="Damian"
  ["VINCULO/Abraham"]="Abraham"
  ["VINCULO/Nico"]="Nico"
  ["OBRA/Leo"]="Leo"
  ["OBRA/Victor"]="Victor"
  ["OBRA/Liam"]="Liam"
  ["OBRA/Orion"]="Orion"
)

# Mapear parent a subruta dentro de GTD
# Parent puede ser "Accionable", "No accionable", "Proyectos", etc.
# Determinar dónde vive el parent dentro de cada GTD
get_parent_path() {
  local spec_path="$1" # ej SER/Axel
  local spec_name="$2" # ej Axel
  local parent="$3"
  case "$parent" in
    "Accionable") echo "$spec_path/$spec_name-GTD/Accionable" ;;
    "No accionable") echo "$spec_path/$spec_name-GTD/No accionable" ;;
    "Proyectos"|"Próximas acciones"|"Calendario"|"Flash"|"Delegadas") echo "$spec_path/$spec_name-GTD/Accionable/$parent" ;;
    "Algún día"|"Referencia"|"Papelera"|"Incubar") echo "$spec_path/$spec_name-GTD/No accionable/$parent" ;;
    *) echo "$spec_path/$spec_name-GTD/$parent" ;;
  esac
}

for spec_path in "${!SPECS[@]}"; do
  spec_name="${SPECS[$spec_path]}"
  parent_path=$(get_parent_path "$spec_path" "$spec_name" "$PARENT")
  full_path="$VAULT/$parent_path/$NAME"
  mkdir -p "$full_path"
  file="$full_path/$NAME.md"
  if [ -f "$file" ]; then
    echo "ya existe $spec_path/$NAME"
    continue
  fi
  # Generar descripcion con óptica del especialista
  case "$spec_name" in
    Axel) desc="Elemento $NAME para Salud visto desde Axel.";;
    Dante) desc="Elemento $NAME para Intelecto visto desde Dante.";;
    Kai) desc="Elemento $NAME para Emociones visto desde Kai.";;
    Elias) desc="Elemento $NAME para Espiritualidad visto desde Elias.";;
    Hugo) desc="Elemento $NAME para Carácter visto desde Hugo.";;
    Damian) desc="Elemento $NAME para Pareja visto desde Damian.";;
    Abraham) desc="Elemento $NAME para Familia visto desde Abraham.";;
    Nico) desc="Elemento $NAME para Amistades visto desde Nico.";;
    Leo) desc="Elemento $NAME para Profesión visto desde Leo.";;
    Victor) desc="Elemento $NAME para Finanzas visto desde Victor.";;
    Liam) desc="Elemento $NAME para Estilo de Vida visto desde Liam.";;
    Orion) desc="Elemento $NAME para Visión visto desde Orion.";;
  esac
  cat > "$file" <<EOF
---
tipo: $TIPO
id: $NAME
nivel: 5
parent: "[[$PARENT]]"
fecha: $FECHA
descripcion: "$desc"
utilidad: "Agrupa $NAME para $spec_name."
percepcion: "$spec_name percibe $NAME como parte de su GTD."
---

# $NAME

> $desc

\`\`\`dataview
TABLE tipo, descripcion
FROM "$parent_path/$NAME"
SORT file.name ASC
\`\`\`
EOF
  echo "creado $spec_path/$NAME"
  # Actualizar contiene del padre
  parent_file="$VAULT/$parent_path/$PARENT.md"
  if [ -f "$parent_file" ]; then
    if ! grep -q "\[\[$NAME\]\]" "$parent_file"; then
      # Añadir a contiene: buscar linea contiene:
      if grep -q "^contiene:" "$parent_file"; then
        sed -i "s/^contiene:.*/&, \"[[$NAME]]\"/" "$parent_file"
      else
        echo "contiene: \"[[$NAME]]\"" >> "$parent_file"
      fi
    fi
  fi
done

echo "Hecho: $NAME fractal en 12 universos bajo $PARENT"
