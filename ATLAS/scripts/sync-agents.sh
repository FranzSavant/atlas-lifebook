#!/bin/bash
# sync-agents.sh — Sincronización PERFECTA bidireccional Maestri ↔ Pi (subagentes).
#
# El mismo agente vive en dos mundos y debe verse idéntico en ambos:
#   Maestri (lienzo):            .maestri/roles/<uuid>/{role.json,AGENTS.md,CLAUDE.md}
#   Pi (Obsidian plugin o TUI):  .pi/agents/<nombre>.md   (subagente declarativo)
#
# Regla de sincronización: EL MÁS NUEVO GANA.
#   - si editaste el rol en Maestri  → se regenera el subagente .pi/agents/
#   - si editaste el subagente en Pi → se actualiza role.json + AGENTS.md + CLAUDE.md
#
# Los 15 roles activos (3 guardianes + 12 especialistas). Los huérfanos viejos
# (Vision, Salud, etc. en inglés) quedan fuera del ecosistema.
#
# Uso: bash ATLAS/scripts/sync-agents.sh
set -e
cd "$(dirname "$0")/../.."   # raíz del vault
VAULT_ROOT="$(pwd)"
VAULT_WIN=$(cygpath -w "$VAULT_ROOT" 2>/dev/null || echo "$VAULT_ROOT")
ROLES_DIR="$VAULT_ROOT/.maestri/roles"
AGENTS_OUT="$VAULT_ROOT/.pi/agents"
ACTIVE_IDS="b7b34772 f2de23f9 91dde7e9 6233df17 68ae5f78 4d861d4b 8a3a4f1f fbe736c3 d316516a c9826c92 eb6b2f58 1ecc4cda fff44f5c 13a5b72b 45db5313"

mkdir -p "$AGENTS_OUT"
UPDATED=0
SYNCED=0

for role_dir in "$ROLES_DIR"/*/; do
  [ -d "$role_dir" ] || continue
  uuid=$(basename "$role_dir" | cut -d- -f1 | tr '[:upper:]' '[:lower:]')
  case " $ACTIVE_IDS " in
    *" $uuid "*) ;;
    *) continue ;;   # rol huérfano: fuera del ecosistema
  esac
  rj="$role_dir/role.json"
  [ -f "$rj" ] || continue
  rj_win=$(cygpath -w "$rj" 2>/dev/null || echo "$rj")

  # --- leer estado actual de ambos lados ---
  META=$(python - "$rj_win" <<'PYEOF'
import json, sys
p = sys.argv[1]
d = json.load(open(p, encoding="utf-8-sig"))
print(json.dumps({"name": d.get("name",""), "prompt": d.get("prompt",""),
                  "color": d.get("color",""), "icon": d.get("icon",""),
                  "id": d.get("id",""), "schema": d.get("schemaVersion",1)}))
PYEOF
  )
  name=$(echo "$META" | python -c "import sys,json;print(json.load(sys.stdin)['name'])")
  prompt_m=$(echo "$META" | python -c "import sys,json;print(json.load(sys.stdin)['prompt'])")
  [ -n "$name" ] || continue
  [ -n "$prompt_m" ] || continue

  pi_file="$AGENTS_OUT/$name.md"
  mtime_m=$(stat -c %Y "$rj" 2>/dev/null || echo 0)
  mtime_p=$(stat -c %Y "$pi_file" 2>/dev/null || echo 0)

  # prompt del lado Pi (cuerpo del .md, sin frontmatter ni sección Fuente de verdad)
  prompt_p=""
  if [ -f "$pi_file" ]; then
    prompt_p=$(python - "$pi_file" <<'PYEOF'
import sys
t = open(sys.argv[1], encoding="utf-8").read()
# quitar frontmatter
if t.startswith("---"):
    t = t.split("---", 2)[2]
# quitar la sección final "## Fuente de verdad"
i = t.find("## Fuente de verdad")
if i >= 0:
    t = t[:i]
print(t.strip())
PYEOF
    )
  fi

  # descripción (para regenerar el subagente; del X.md si existe)
  XMD=$(find "$VAULT_ROOT/SER" "$VAULT_ROOT/VINCULO" "$VAULT_ROOT/OBRA" -maxdepth 2 -iname "$name.md" 2>/dev/null | head -n 1)
  DESC=""
  if [ -n "$XMD" ]; then
    DESC=$(grep -m1 "^descripcion:" "$XMD" 2>/dev/null | sed 's/^descripcion:[[:space:]]*//;s/"//g' | cut -c1-140)
  fi
  [ -n "$DESC" ] || DESC="Agente $name de Atlas-LifeBook (Maestri ↔ Pi)"

  REL=""
  if [ -n "$XMD" ]; then
    REL=$(echo "$XMD" | sed "s|$VAULT_ROOT/||")
  else
    case "$name" in
      Ser) REL="SER/SER.md" ;;
      Vinculo) REL="VINCULO/VINCULO.md" ;;
      Obra) REL="OBRA/OBRA.md" ;;
      *) REL="$name/$name.md" ;;
    esac
  fi

  if [ "$mtime_p" -gt "$mtime_m" ] && [ -n "$prompt_p" ] && [ "$prompt_p" != "$prompt_m" ]; then
    # ===== Pi (más nuevo) → Maestri =====
    python - "$rj_win" "$name" "$prompt_p" "$META" <<'PYEOF'
import json, sys, os
rj, name, prompt_p, meta_json = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
meta = json.loads(meta_json)
d = json.load(open(rj, encoding="utf-8-sig"))
d["prompt"] = prompt_p
with open(rj, "w", encoding="utf-8") as f:
    json.dump(d, f, ensure_ascii=False, indent=2)
base = os.path.splitext(rj)[0]
wrap = f"<your_assigned_role>\n{prompt_p}\n</your_assigned_role>\n\n<working_directory>\nIMPORTANT: You were started in this directory to receive the above role assignment. The actual project you should be working on is located at:\n"
for ext in ("AGENTS.md", "CLAUDE.md"):
    p = os.path.join(os.path.dirname(rj), ext)
    if os.path.exists(p):
        with open(p, "w", encoding="utf-8") as f:
            f.write(wrap)
PYEOF
    echo "  ⇢ $name: editado en Pi → Maestri actualizado"
    UPDATED=$((UPDATED+1))

  elif [ "$mtime_m" -ge "$mtime_p" ] && [ "$prompt_m" != "$prompt_p" ]; then
    # ===== Maestri (más nuevo) → Pi =====
    cat > "$pi_file" <<MDEOF
---
name: $name
description: $DESC
tools:
  - read
  - grep
  - find
  - write
  - edit
  - bash
---

$prompt_m

## Fuente de verdad

Tu identidad vive en el vault: **\`$REL\`** (y su Statement privado si existe).
Regla: lee tu .md antes de responder y escribilo tras actualizar. Markdown manda.
MDEOF
    echo "  ⇠ $name: editado en Maestri → subagente Pi regenerado"
    UPDATED=$((UPDATED+1))
  else
    SYNCED=$((SYNCED+1))
  fi
done

echo "---"
echo "Sincronizados: $SYNCED · Actualizados: $UPDATED (de 15 roles activos)"
echo "Pi: $AGENTS_OUT ($(ls -1 "$AGENTS_OUT"/*.md 2>/dev/null | wc -l) subagentes)"