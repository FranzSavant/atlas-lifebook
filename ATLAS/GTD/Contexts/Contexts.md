---
tipo: taxonomia
nivel: 2
id: Contexts
fecha: 2026-09-08
descripcion: "Taxonomía de contextos GTD — dónde/cómo puedes ejecutar una acción, vista global desde ATLAS."
utilidad: "Filtra próximas acciones por lugar/herramienta."
percepcion: "ATLAS percibe contextos como el terreno donde actúas."
parent: "[[GTD]]"
contiene: "[[shopping]]", "[[oficina]]", "[[casa]]", "[[apartamento]]", "[[pc]]", "[[cel]]"
---

# Contexts

> Taxonomía de contextos — 6 valores iniciales. Cada valor es un nodo .md con su dataview que agrupa todo  en los 12 universos.

```dataview
TABLE tipo, id
FROM "ATLAS/GTD/Contexts"
WHERE id != "Contexts"
SORT id ASC
```
