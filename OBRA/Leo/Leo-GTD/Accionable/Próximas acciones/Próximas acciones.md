---
tipo: contenedor-gtd
nivel: 4
id: Próximas acciones
fecha: 2026-09-08
descripcion: "Contenedor Próximas acciones — Profesión y misión visto desde Leo."
utilidad: "Organiza Próximas acciones para Leo."
percepcion: "Leo percibe trabajo como obra."
parent: "[[Accionable]]"
---

# Próximas acciones

> Próximas acciones sin fecha de Profesion.

```dataview
TABLE tipo, id, parent
FROM "OBRA/Leo/Leo-GTD/Accionable/Próximas acciones"
WHERE file.name != "Próximas acciones"
SORT file.name ASC
```
