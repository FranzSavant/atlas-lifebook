---
tipo: valor-contexto
nivel: 3
id: apartamento
fecha: 2026-09-08
descripcion: "Contexto apartamento — segunda residencia, estancia alternativa."
utilidad: "Separa lo de apartamento de casa."
percepcion: "ATLAS percibe apartamento como base secundaria."
parent: "[[Contexts]]"
---

# apartamento

> Valor de contexto **apartamento** — nodo del sistema. Agrupa todas las acciones con `contexto: [[apartamento]]` en todo Atlas. Óptica global ATLAS.

```dataview
TABLE parent, id, energia
FROM ""
WHERE contains(contexto, [[apartamento]]) OR contexto = [[apartamento]]
SORT file.name ASC
```
