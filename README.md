# Atlas — LifeBook fractal

Organiza tu vida en 12 áreas y convierte tus metas en tareas diarias.
Plantilla para Obsidian, lista para usar en 2 minutos.

## ¿Qué es esto?

Un vault de Obsidian donde el método **LifeBook** (12 áreas de vida) se encuentra con **GTD** (gestión de tareas). Todo es markdown: cada carpeta es un nodo con su `.md`, su metadatos y sus vínculos `[[...]]`.

```
ATLAS        → orquesta el sistema (metasistema + GTD global)
├── SER      → Interior: cuerpo, mente, emociones, espíritu
├── VINCULO  → Relaciones: carácter, pareja, familia, amistades
└── OBRA     → Manifestación: profesión, finanzas, estilo de vida, visión
```

Cada una de las 12 áreas tiene su propio universo GTD (Proyectos, Próximas acciones, Calendario, Flash, Delegadas, Algún día, Referencia, Papelera, Incubar).

## ¿Cómo empiezo?

1. Instala [Obsidian](https://obsidian.md) y abre este vault.
2. (Opcional) Instala la comunidad de agentes [Maestri](https://maestri.app) — los `.md` ya están preparados como agentes.
3. Crea tu primer elemento GTD con la plantilla `ATLAS/GTD/Templates/Proyecto.md`.
4. Añade contextos (`shopping, oficina, casa, apartamento, pc, cel`) y niveles de energía (`flow, active, flat, numb, zombie`) desde `ATLAS/GTD/`.

## Filosofía

- **El markdown manda.** Tu vida vive en los `.md`, no en ninguna app.
- **Todo tiene metadatos.** `fecha`, `id`, `descripcion`, `utilidad`, `percepcion`, `parent`, `contiene`.
- **Todo tiene dataview.** Cada contenedor se lista solo a partir de sus archivos.
- **Fractal.** Cada nivel replica la misma estructura: contenedor → índice → hijos.

## Scripts

| Script | Qué hace |
|---|---|
| `ATLAS/scripts/sync-skills.sh` | Sincroniza las skills del espejo humano a Pi |
| `ATLAS/scripts/item-gtd.sh` | Crea un contenedor GTD en los 12 universos |
| `ATLAS/scripts/bootstrap-maestri.sh` | Crea los 4 agentes iniciales (Atlas + 3 guardianes) |

## Licencia

MIT — usa, cambia y comparte.