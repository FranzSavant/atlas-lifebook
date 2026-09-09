---
tipo: contenedor-gtd
nivel: 4
id: Proyectos
fecha: 2026-09-08
descripcion: "Contenedor Proyectos — Familia y legado visto desde Abraham."
utilidad: "Organiza Proyectos para Abraham."
percepcion: "Abraham percibe familia como equipo."
parent: "[[Accionable]]"
---

# Proyectos

> Contenedor de proyectos — cada proyecto es un .md con propósito/resultado/directrices + referencia a próxima acción.

```dataview
TABLE tipo, id, parent
FROM "VINCULO/Abraham/Abraham-GTD/Accionable/Proyectos"
WHERE file.name != "Proyectos"
SORT file.name ASC
```
