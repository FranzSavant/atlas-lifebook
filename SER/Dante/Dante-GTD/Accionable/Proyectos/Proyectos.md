---
tipo: contenedor-gtd
nivel: 4
id: Proyectos
fecha: 2026-09-08
descripcion: "Contenedor Proyectos — Mente y aprendizaje continuo visto desde Dante."
utilidad: "Organiza Proyectos para Dante."
percepcion: "Dante percibe hambre de claridad, no de info."
parent: "[[Accionable]]"
---

# Proyectos

> Contenedor de proyectos — cada proyecto es un .md con propósito/resultado/directrices + referencia a próxima acción.

```dataview
TABLE tipo, id, parent
FROM "SER/Dante/Dante-GTD/Accionable/Proyectos"
WHERE file.name != "Proyectos"
SORT file.name ASC
```
