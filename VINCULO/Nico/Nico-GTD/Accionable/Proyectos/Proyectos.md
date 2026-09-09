---
tipo: contenedor-gtd
nivel: 4
id: Proyectos
fecha: 2026-09-08
descripcion: "Contenedor Proyectos — Amistades y tribu visto desde Nico."
utilidad: "Organiza Proyectos para Nico."
percepcion: "Nico percibe tribu elegida, no heredada."
parent: "[[Accionable]]"
---

# Proyectos

> Contenedor de proyectos — cada proyecto es un .md con propósito/resultado/directrices + referencia a próxima acción.

```dataview
TABLE tipo, id, parent
FROM "VINCULO/Nico/Nico-GTD/Accionable/Proyectos"
WHERE file.name != "Proyectos"
SORT file.name ASC
```
