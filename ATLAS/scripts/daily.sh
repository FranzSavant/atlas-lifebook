#!/bin/bash
# daily.sh — Rutina diaria de Atlas (corre a las 6:00 hora de El Salvador).
# Reúne TODO lo que debe pasar cada día sin intervención:
#   1. sync de skills (espejo humano ATLAS/skills → .pi/skills)
#   2. sync de agentes (Maestri ⇄ Pi, el más nuevo gana)
#   3. backup completo a GitHub privado (notas + sesiones)
# Log en ATLAS/scripts/logs/daily-YYYY-MM-DD.log
#
# Uso: bash ATLAS/scripts/daily.sh
set -e
cd "$(dirname "$0")/../.."   # raíz del vault

LOG_DIR="$PWD/ATLAS/scripts/logs"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/daily-$(date '+%Y-%m-%d').log"

echo "=== Rutina diaria Atlas: $(date '+%Y-%m-%d %H:%M') ===" | tee "$LOG"

echo "" >> "$LOG"
echo "--- 1/5 Telegram (bandeja movil) ---" | tee -a "$LOG"
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
  bash ATLAS/scripts/telegram-pull.sh --pull >> "$LOG" 2>&1 || echo "  (sin token o sin mensajes)" | tee -a "$LOG"
else
  echo "  (sin TELEGRAM_BOT_TOKEN)" | tee -a "$LOG"
fi

echo "" >> "$LOG"
echo "--- 1/4 Inbox (captura) ---" | tee -a "$LOG"
if ls "$PWD"/Inbox/*.md >/dev/null 2>&1; then
  echo "  Items pendientes en Inbox — Atlas los ruteará al iniciar sesión." | tee -a "$LOG"
  bash ATLAS/scripts/inbox-scan.sh >> "$LOG" 2>&1 || true
else
  echo "  (Inbox vacío)" | tee -a "$LOG"
fi

echo "" >> "$LOG"
echo "--- 1/3 Skills (ATLAS/skills → .pi/skills) ---" | tee -a "$LOG"
if [ -f ATLAS/scripts/sync-skills.sh ]; then
  bash ATLAS/scripts/sync-skills.sh >> "$LOG" 2>&1 || echo "  ⚠ sync-skills falló (ver log)" | tee -a "$LOG"
else
  echo "  (no hay sync-skills.sh)" | tee -a "$LOG"
fi

echo "" >> "$LOG"
echo "--- 2/3 Agentes (Maestri ⇄ Pi) ---" | tee -a "$LOG"
bash ATLAS/scripts/sync-agents.sh >> "$LOG" 2>&1 || echo "  ⚠ sync-agents falló (ver log)" | tee -a "$LOG"

echo "" >> "$LOG"
echo "--- 3/3 Backup GitHub (privado) ---" | tee -a "$LOG"
bash ATLAS/scripts/backup.sh >> "$LOG" 2>&1 || echo "  ⚠ backup falló (ver log)" | tee -a "$LOG"

echo "" >> "$LOG"
echo "=== Rutina completa $(date '+%H:%M') — log: $LOG ===" | tee -a "$LOG"