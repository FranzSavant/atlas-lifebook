---
tipo: contenedor-gtd
nivel: 4
id: Proyectos
fecha: 2026-09-08
descripcion: "Contenedor Proyectos — Visión y legado visto desde Orion."
utilidad: "Organiza Proyectos para Orion."
percepcion: "Orion percibe tu visión como norte."
parent: "[[Accionable]]"
---

# Proyectos

> Contenedor de proyectos — cada proyecto es un .md con propósito/resultado/directrices + referencia a próxima acción.

```dataview
TABLE tipo, id, parent
FROM "OBRA/Orion/Orion-GTD/Accionable/Proyectos"
WHERE file.name != "Proyectos"
SORT file.name ASC
```
