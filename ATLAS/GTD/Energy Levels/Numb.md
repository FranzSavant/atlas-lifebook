---
tipo: valor-energia
nivel: 3
id: Numb
fecha: 2026-09-08
descripcion: "Estado Numb — embotado, piloto automático, sin chispa, nublina."
utilidad: "Solo tareas mecánicas, nada que requiera criterio."
percepcion: "ATLAS percibe Numb como señal de recarga pendiente."
parent: "[[Energy Levels]]"
energia: "[[Numb]]"
---

# Numb

> **Numb** avisa que te pasaste de Active sin recarga. Aquí solo Papelera ligera, ordenar, caminar. No decidas importante en Numb.

```dataview
TABLE parent, id, contexto
FROM ""
WHERE contains(energia, [[Numb]])
SORT file.name ASC
```
