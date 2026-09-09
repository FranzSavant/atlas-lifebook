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
2. Instala [Pi](https://github.com/earendil-works/pi) como agente y abrí una sesión en la raíz del vault.
   Al iniciar, el agente lee `AGENTS.md`: se presenta, verifica si tenés respaldo
   configurado y (si no lo tenés) te pregunta si querés activarlo en GitHub.
3. (Opcional) Instala la comunidad de agentes [Maestri](https://maestri.app) — los `.md` ya están preparados como agentes.
4. Crea tu primer elemento GTD con la plantilla `ATLAS/GTD/Templates/Proyecto.md`.
5. Añade contextos (`shopping, oficina, casa, apartamento, pc, cel`) y niveles de energía (`flow, active, flat, numb, zombie`) desde `ATLAS/GTD/`.

## Tu vida, a salvo (y tu agente se acuerda)

El sistema incluye respaldo y memoria integrados:

- **Respaldo privado a GitHub.** El agente te pregunta la primera vez si querés
  configurar un repo privado para tu vida. Con `bash ATLAS/scripts/backup.sh`
  respaldás notas **y** conversaciones. Tu contenido personal jamás va al repo
  público de la plantilla.
- **Memoria del agente.** El agente busca en tus notas `.md` y en tus
  conversaciones pasadas antes de responder. Si existe un dato, te dice dónde
  (`fuente: [[...]]`); si no existe, te lo dice sin inventar. Vos solo hablás;
  él se acuerda.

```
bash ATLAS/scripts/backup-status.sh   # ¿hay respaldo? (OK / NO / PARCIAL)
bash ATLAS/scripts/backup-setup.sh    # configurar respaldo privado (primera vez)
bash ATLAS/scripts/backup.sh          # respaldo ahora (notas + sesiones)
bash ATLAS/scripts/recall.sh "texto"  # buscar en notas + conversaciones
```

## Filosofía

- **El markdown manda.** Tu vida vive en los `.md`, no en ninguna app.
- **Todo tiene metadatos.** `fecha`, `id`, `descripcion`, `utilidad`, `percepcion`, `parent`, `contiene`.
- **Todo tiene dataview.** Cada contenedor se lista solo a partir de sus archivos.
- **Fractal.** Cada nivel replica la misma estructura: contenedor → índice → hijos.
- **Privado vs público.** `*-Statement.md` (tu voz personal) y tu contenido son
  privados por diseño; el repo público solo lleva la plantilla.

## Scripts

| Script | Qué hace |
|---|---|
| `ATLAS/scripts/sync-skills.sh` | Sincroniza las skills del espejo humano a Pi |
| `ATLAS/scripts/item-gtd.sh` | Crea un contenedor GTD en los 12 universos |
| `ATLAS/scripts/bootstrap-maestri.sh` | Crea los 4 agentes iniciales (Atlas + 3 guardianes) |
| `ATLAS/scripts/backup.sh` | Respaldo completo (notas + sesiones) a GitHub privado |
| `ATLAS/scripts/backup-status.sh` | ¿Hay respaldo configurado? (OK / NO / PARCIAL) |
| `ATLAS/scripts/backup-setup.sh` | Configura el respaldo privado la primera vez |
| `ATLAS/scripts/recall.sh` | Memoria del agente: busca en notas + conversaciones (grep) |
| `ATLAS/scripts/recall-semantic.sh` | Memoria semántica: busca por significado (`--index` incremental / `--full` completo) |
| `ATLAS/scripts/session-search.sh` | Busca solo en conversaciones pasadas |
| `ATLAS/scripts/sync-agents.sh` | Sincroniza roles Maestri ⇄ subagentes Pi (el más nuevo gana) |
| `ATLAS/scripts/daily.sh` | Rutina 06:00: skills + agentes + backup GitHub |

## Licencia

MIT — usa, cambia y comparte.