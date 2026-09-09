---
tipo: valor-energia
nivel: 3
id: Zombie
fecha: 2026-09-08
descripcion: "Estado Zombie — fundido, sin batería, zombie mode."
utilidad: "Supervivencia mínima, incubar y descansar."
percepcion: "ATLAS percibe Zombie como stop obligatorio."
parent: "[[Energy Levels]]"
energia: "[[Zombie]]"
---

# Zombie

> **Zombie** es tu freno. No es para producir. Ve a Incubar, duerme, hidrátate. Todo lo que hagas en Zombie costará triple y saldrá mal.

```dataview
TABLE parent, id, contexto
FROM ""
WHERE contains(energia, [[Zombie]])
SORT file.name ASC
```
