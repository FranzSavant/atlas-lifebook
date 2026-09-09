---
tipo: indice
id: SkillsMirror
parent: "[[ATLAS]]"
fecha: 2026-09-08
descripcion: "Espejo legible de skills — verdad humana. Pi lee desde .pi/skills."
utilidad: "Ves y editas aquí cómodo, sin entrar a carpeta oculta."
percepcion: "ATLAS percibe este espejo como fachada humana de .pi/skills."
---

# Skills — Espejo Legible

> **Espejo humano** de `/.pi/skills` (donde Pi realmente busca por ser proyecto-local).
> 
> **Flujo:** editas aquí en `ATLAS/skills/mi-skill/SKILL.md` → sync copia a `Atlas/.pi/skills/mi-skill/SKILL.md` → Pi lo detecta al hacer `/reload` o reiniciar.
> 
> **Sync:** `powershell ./scripts/sync-skills.ps1` o `bash ./scripts/sync-skills.sh` (ver `scripts/README.md`).

```dataview
TABLE tipo, id
FROM "ATLAS/skills"
SORT id ASC
```
