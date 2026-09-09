#!/bin/bash
# telegram-pull.sh — Bandeja de Telegram ↔ Inbox de Atlas.
# El bot recibe mensajes desde el celular (texto, links, reenvíos de FB/YT);
# este script los baja al vault y limpia lo ya procesado.
#
# Uso:
#   bash ATLAS/scripts/telegram-pull.sh          → jalar nuevos + limpiar procesados
#   bash ATLAS/scripts/telegram-pull.sh --pull   → solo bajar mensajes nuevos
#   bash ATLAS/scripts/telegram-pull.sh --cleanup → solo borrar lo ya procesado
#   bash ATLAS/scripts/telegram-pull.sh --peek URL → título real de un link
set -e
cd "$(dirname "$0")/../.."   # raíz del vault

: "${TELEGRAM_BOT_TOKEN:?Falta TELEGRAM_BOT_TOKEN — configúrala con: setx TELEGRAM_BOT_TOKEN tu_token}"
export TELEGRAM_BOT_TOKEN

MODE="todo"
case "${1:-}" in
  --pull) MODE="pull" ;;
  --cleanup) MODE="cleanup" ;;
  --peek) MODE="peek" ;;
esac

case "$MODE" in
  todo)
    echo "=== Telegram: jalando mensajes nuevos ==="
    python ATLAS/scripts/python/telegram_pull.py --pull
    echo "=== Telegram: limpiando lo ya procesado ==="
    python ATLAS/scripts/python/telegram_pull.py --cleanup
    ;;
  pull)
    python ATLAS/scripts/python/telegram_pull.py --pull
    ;;
  cleanup)
    python ATLAS/scripts/python/telegram_pull.py --cleanup
    ;;
  peek)
    export TELEGRAM_BOT_TOKEN=1  # peek no necesita el bot real
    python ATLAS/scripts/python/telegram_pull.py --peek "$2"
    ;;
esac