---
tipo: contenedor-gtd
nivel: 4
id: Delegadas
fecha: 2026-09-08
descripcion: "Contenedor Delegadas — Amistades y tribu visto desde Nico."
utilidad: "Organiza Delegadas para Nico."
percepcion: "Nico percibe tribu elegida, no heredada."
parent: "[[Accionable]]"
---

# Delegadas

> Acciones delegadas / en espera de Amistades.

```dataview
TABLE tipo, id, parent
FROM "VINCULO/Nico/Nico-GTD/Accionable/Delegadas"
WHERE file.name != "Delegadas"
SORT file.name ASC
```
