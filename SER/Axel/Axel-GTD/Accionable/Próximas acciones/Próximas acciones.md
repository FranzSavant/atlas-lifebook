---
tipo: contenedor-gtd
nivel: 4
id: Próximas acciones
fecha: 2026-09-08
descripcion: "Contenedor Próximas acciones — Salud y energía — base física vista desde Axel."
utilidad: "Organiza Próximas acciones para Axel."
percepcion: "Axel percibe tu energía como palanca, no como estética."
parent: "[[Accionable]]"
---

# Próximas acciones

> Próximas acciones sin fecha de Salud.

```dataview
TABLE tipo, id, parent
FROM "SER/Axel/Axel-GTD/Accionable/Próximas acciones"
WHERE file.name != "Próximas acciones"
SORT file.name ASC
```
