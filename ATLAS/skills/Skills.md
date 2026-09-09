---
tipo: contenedor-skills
nivel: 2
id: Skills
fecha: 2026-09-08
descripcion: "Contenedor intermedio de skills — agrupa todas las skills vistas desde ATLAS."
utilidad: "Punto de entrada para ver todas las skills."
percepcion: "ATLAS percibe Skills como su caja de herramientas."
parent: "[[ATLAS]]"
contiene: "[[hello-atlas]]", "[[Tags]]"
---

# Skills

> Nodo intermedio entre ATLAS y tus skills. Entra aquí para ver todas.

```dataview
TABLE tipo, descripcion
FROM "ATLAS/skills"
WHERE parent = [[Skills]] OR contains(parent, [[Skills]])
SORT id ASC
```
