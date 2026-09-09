#!/bin/bash
# bootstrap-maestri — Marca blanca: crea 4 terminales limpias (ATLAS + 3 guardianes)
# Los 12 especialistas se crean luego con /crear-12 tras promover a maestros
set -e
echo "=== Bootstrap Atlas — 4 terminales ==="
maestri recruit "Ser" --role "Ser" 2>&1 | head -n 2 || echo "Ser ya existe"
maestri recruit "Vinculo" --role "Vinculo" 2>&1 | head -n 2 || echo "Vinculo ya existe"
maestri recruit "Obra" --role "Obra" 2>&1 | head -n 2 || echo "Obra ya existe"
echo "Listo: 4 terminales. Para desplegar los 12, promueve a los 3 a maestros y corre /crear-12 en cada uno."
maestri list
