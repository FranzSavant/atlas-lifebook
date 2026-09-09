---
tipo: contenedor-gtd
nivel: 4
id: Proyectos
fecha: 2026-09-08
descripcion: "Contenedor Proyectos — Estilo de vida y día ideal visto desde Liam."
utilidad: "Organiza Proyectos para Liam."
percepcion: "Liam percibe estilo como diseño intencional."
parent: "[[Accionable]]"
---

# Proyectos

> Contenedor de proyectos — cada proyecto es un .md con propósito/resultado/directrices + referencia a próxima acción.

```dataview
TABLE tipo, id, parent
FROM "OBRA/Liam/Liam-GTD/Accionable/Proyectos"
WHERE file.name != "Proyectos"
SORT file.name ASC
```
