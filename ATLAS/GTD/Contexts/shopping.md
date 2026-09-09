---
tipo: valor-contexto
nivel: 3
id: shopping
fecha: 2026-09-08
descripcion: "Contexto shopping — compras y recados de adquisición."
utilidad: "Agrupa todo lo que requiere comprar."
percepcion: "ATLAS percibe shopping como reabastecimiento."
parent: "[[Contexts]]"
---

# shopping

> Valor de contexto **shopping** — nodo del sistema. Agrupa todas las acciones con `contexto: [[shopping]]` en todo Atlas. Óptica global ATLAS.

```dataview
TABLE parent, id, energia
FROM ""
WHERE contains(contexto, [[shopping]]) OR contexto = [[shopping]]
SORT file.name ASC
```
