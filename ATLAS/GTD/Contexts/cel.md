---
tipo: valor-contexto
nivel: 3
id: cel
fecha: 2026-09-08
descripcion: "Contexto cel — móvil, acciones rápidas en cualquier lugar."
utilidad: "Agrupa lo que resuelves con el móvil."
percepcion: "ATLAS percibe cel como navaja suiza."
parent: "[[Contexts]]"
---

# cel

> Valor de contexto **cel** — nodo del sistema. Agrupa todas las acciones con `contexto: [[cel]]` en todo Atlas. Óptica global ATLAS.

```dataview
TABLE parent, id, energia
FROM ""
WHERE contains(contexto, [[cel]]) OR contexto = [[cel]]
SORT file.name ASC
```
