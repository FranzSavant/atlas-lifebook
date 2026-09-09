---
tipo: indice
id: Tools
parent: "[[ATLAS]]"
fecha: 2026-09-08
descripcion: "Tools — CLIs únicos, no llevan plantilla. Cada tool es única y se documenta con README."
utilidad: "Cada tool vive en tools/<nombre>/README.md + binario. La skill lo llama con bash."
percepcion: "ATLAS percibe tools como manos únicas, no como nodos templanteables."
---

# Tools

No usamos `Templates/` para tools — cada tool es única y casi nunca la lee un humano directamente.

Vive en:
- Espejo legible: `Atlas/tools/<mi-tool>/README.md` + ejecutable
- Para Pi (si es extensión): `Atlas/.pi/extensions/<mi-tool>/` (TypeScript con pi.registerTool)

La skill es la que sabe cómo llamarla: `bash tools/mi-tool --help`
