---
tipo: valor-contexto
nivel: 3
id: pc
fecha: 2026-09-08
descripcion: "Contexto pc — ordenador, trabajo digital profundo."
utilidad: "Filtra lo que necesita pantalla y foco."
percepcion: "ATLAS percibe pc como taller digital."
parent: "[[Contexts]]"
---

# pc

> Valor de contexto **pc** — nodo del sistema. Agrupa todas las acciones con `contexto: [[pc]]` en todo Atlas. Óptica global ATLAS.

```dataview
TABLE parent, id, energia
FROM ""
WHERE contains(contexto, [[pc]]) OR contexto = [[pc]]
SORT file.name ASC
```
