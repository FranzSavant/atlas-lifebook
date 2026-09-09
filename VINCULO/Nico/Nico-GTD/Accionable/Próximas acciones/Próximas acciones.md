---
tipo: contenedor-gtd
nivel: 4
id: Próximas acciones
fecha: 2026-09-08
descripcion: "Contenedor Próximas acciones — Amistades y tribu visto desde Nico."
utilidad: "Organiza Próximas acciones para Nico."
percepcion: "Nico percibe tribu elegida, no heredada."
parent: "[[Accionable]]"
---

# Próximas acciones

> Próximas acciones sin fecha de Amistades.

```dataview
TABLE tipo, id, parent
FROM "VINCULO/Nico/Nico-GTD/Accionable/Próximas acciones"
WHERE file.name != "Próximas acciones"
SORT file.name ASC
```
