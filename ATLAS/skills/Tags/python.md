---
tipo: tag-skill
nivel: 4
id: python
fecha: 2026-09-08
descripcion: "Tag python — agrupa skills que usan python."
utilidad: "Filtra skills python."
percepcion: "ATLAS percibe python como navaja suiza."
parent: "[[Tags]]"
---

# python

> Tag para skills con `tags: [[python]]`.

```dataview
TABLE parent, descripcion
FROM "ATLAS/skills"
WHERE contains(tags, [[python]])
SORT id ASC
```
