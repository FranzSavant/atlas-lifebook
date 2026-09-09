---
tipo: contenedor-gtd
nivel: 4
id: Calendario
fecha: 2026-09-08
descripcion: "Contenedor Calendario — Amistades y tribu visto desde Nico."
utilidad: "Organiza Calendario para Nico."
percepcion: "Nico percibe tribu elegida, no heredada."
parent: "[[Accionable]]"
---

# Calendario

> Acciones con fecha/hora de Amistades.

```dataview
TABLE tipo, id, parent
FROM "VINCULO/Nico/Nico-GTD/Accionable/Calendario"
WHERE file.name != "Calendario"
SORT file.name ASC
```
