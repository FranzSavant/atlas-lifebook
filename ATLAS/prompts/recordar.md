---
tipo: prompt
id: recordar
parent: "[[ATLAS]]"
fecha: 2026-09-09
descripcion: "Prompt para buscar en sesiones pasadas (lo que no vive en .md)."
utilidad: "Recupera decisiones y conversaciones que solo existen en JSONL."
percepcion: "ATLAS percibe recordar como memoria viva de las charlas."
---

# recordar — Buscar entre sesiones

Escribe `/recordar "texto"` en **ATLAS** para buscar en todas las conversaciones pasadas (tuyas y de los agentes) lo que no se guardó en `.md`.

Ejecuta `bash ATLAS/scripts/session-search.sh "texto"` — busca en los JSONL de sesiones de Pi y de los 15 agentes Maestri.
