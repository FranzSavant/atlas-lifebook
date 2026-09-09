---
tipo: valor-contexto
nivel: 3
id: oficina
fecha: 2026-09-08
descripcion: "Contexto oficina — trabajo presencial, reuniones, recursos de oficina."
utilidad: "Filtra lo que solo puedes hacer en oficina."
percepcion: "ATLAS percibe oficina como modo colaborativo."
parent: "[[Contexts]]"
---

# oficina

> Valor de contexto **oficina** — nodo del sistema. Agrupa todas las acciones con `contexto: [[oficina]]` en todo Atlas. Óptica global ATLAS.

```dataview
TABLE parent, id, energia
FROM ""
WHERE contains(contexto, [[oficina]]) OR contexto = [[oficina]]
SORT file.name ASC
```
