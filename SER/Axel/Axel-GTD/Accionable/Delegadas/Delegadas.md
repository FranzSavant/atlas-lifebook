---
tipo: contenedor-gtd
nivel: 4
id: Delegadas
fecha: 2026-09-08
descripcion: "Contenedor Delegadas — Salud y energía — base física vista desde Axel."
utilidad: "Organiza Delegadas para Axel."
percepcion: "Axel percibe tu energía como palanca, no como estética."
parent: "[[Accionable]]"
---

# Delegadas

> Acciones delegadas / en espera de Salud.

```dataview
TABLE tipo, id, parent
FROM "SER/Axel/Axel-GTD/Accionable/Delegadas"
WHERE file.name != "Delegadas"
SORT file.name ASC
```
