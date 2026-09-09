---
tipo: tag-skill
nivel: 4
id: automatizacion
fecha: 2026-09-08
descripcion: "Tag automatización — agrupa skills de automatización."
utilidad: "Filtra skills que automatizan."
percepcion: "ATLAS percibe automatización como atajo."
parent: "[[Tags]]"
---

# automatizacion

> Tag para skills con `tags: [[automatizacion]]`.

```dataview
TABLE parent, descripcion
FROM "ATLAS/skills"
WHERE contains(tags, [[automatizacion]])
SORT id ASC
```
