#!/bin/bash
# backup-status.sh — ¿Hay respaldo configurado? (para preguntar al iniciar sesión)
# Uso: bash ATLAS/scripts/backup-status.sh
#   sale 0 + "OK <remoto>"  → hay respaldo
#   sale 1 + "NO"           → no hay respaldo configurado
set -e
cd "$(dirname "$0")/../.."   # raíz del vault

if [ -d ".git" ] && git remote get-url origin >/dev/null 2>&1; then
  REMOTE=$(git remote get-url origin)
  # ¿el remoto es un backup real o es el repo público de la plantilla?
  case "$REMOTE" in
    *atlas-lifebook*|*plantilla*|*template*|*white*label*)
      echo "PARCIAL"
      exit 2
      ;;
  esac
  echo "OK $REMOTE"
  exit 0
else
  echo "NO"
  exit 1
fi