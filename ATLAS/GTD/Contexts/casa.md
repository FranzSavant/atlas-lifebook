---
tipo: valor-contexto
nivel: 3
id: casa
fecha: 2026-09-08
descripcion: "Contexto casa — hogar principal, tareas domésticas y base."
utilidad: "Agrupa lo que haces en casa."
percepcion: "ATLAS percibe casa como centro operativo."
parent: "[[Contexts]]"
---

# casa

> Valor de contexto **casa** — nodo del sistema. Agrupa todas las acciones con `contexto: [[casa]]` en todo Atlas. Óptica global ATLAS.

```dataview
TABLE parent, id, energia
FROM ""
WHERE contains(contexto, [[casa]]) OR contexto = [[casa]]
SORT file.name ASC
```
