---
tipo: prompt
id: publicar
parent: "[[ATLAS]]"
fecha: 2026-09-09
descripcion: "Prompt para publicar mejoras de plantilla al repo público."
utilidad: "Publica solo la marca blanca, jamás lo personal."
percepcion: "ATLAS percibe publicar como mostrar la vitrina."
---

# publicar — Push al público

Escribe `/publicar` en **ATLAS** para publicar mejoras de plantilla al repo público `atlas-lifebook`.

Ejecuta `bash ATLAS/scripts/publish-public.sh "mensaje"` — solo copia lo del manifest (identidades, estructura, plantillas, scripts) y sanitiza cualquier referencia a `*-Statement.md`. Lo personal nunca cruza.
