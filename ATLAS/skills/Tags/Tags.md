---
tipo: taxonomia
nivel: 3
id: Tags
fecha: 2026-09-08
descripcion: "Taxonomía de tags para skills — agrupa skills por tipo."
utilidad: "Filtra skills por tag."
percepcion: "ATLAS percibe Tags como índice de skills."
parent: "[[Skills]]"
contiene: "[[automatizacion]]", "[[python]]"
---

# Tags

> Índice de tags de skills.

```dataview
TABLE tipo, descripcion
FROM "ATLAS/skills/Tags"
WHERE id != "Tags"
SORT id ASC
```
