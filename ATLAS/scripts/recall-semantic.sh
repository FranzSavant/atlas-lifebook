#!/bin/bash
# recall-semantic.sh — Búsqueda semántica sobre Atlas (notas + sesiones).
# Usa gemini-embedding (Google free tier, con fallback a OpenRouter).
# Uso:
#   bash ATLAS/scripts/recall-semantic.sh "pregunta" [n]   → buscar (default 5)
#   bash ATLAS/scripts/recall-semantic.sh --index          → incremental (solo lo que cambió)
#   bash ATLAS/scripts/recall-semantic.sh --full           → reconstruir TODO desde cero
#   bash ATLAS/scripts/recall-semantic.sh --index --quick  → solo notas
set -e
cd "$(dirname "$0")/../.."   # raíz del vault

# cargar keys desde variables de entorno (configuradas a nivel de usuario)
: "${GEMINI_API_KEY:?Falta GEMINI_API_KEY — configúrala con: setx GEMINI_API_KEY tu_key}"
export GEMINI_API_KEY
[ -n "$OPENROUTER_API_KEY" ] && export OPENROUTER_API_KEY

# Traducir: si el primer arg no es un flag, es una consulta → anteponer --search
case "${1:-}" in
  --index|--full|--search|--quick|--help|-h) ;;
  *) set -- --search "$@" ;;
esac

python ATLAS/scripts/python/recall_semantic.py "$@"
