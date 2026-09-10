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

---

## FAQ — Preguntas frecuentes

### ¿Cómo hago que mi agente lea los videos de Facebook que comparto?

1. Instala yt-dlp: `pip install yt-dlp`
2. Ejecutá `atlas-login.cmd` — abre Chrome con un perfil dedicado (AtlasAgent).
   **Logueate en Facebook una sola vez** en esa ventana y cerrala.
3. Listo. Cada vez que llegue el link de un video, el sistema descarga el audio
   y lo transcribe completo:

```bash
python ATLAS/scripts/python/reel_transcribe.py "https://www.facebook.com/reel/ID"
```

> **¿Por qué me pide login?** Facebook no deja leer videos privados sin sesión.
> El sistema usa tu propio Chrome (perfil AtlasAgent) como "vos" — silencioso y local.

### ¿Cómo creo el bot de Telegram para capturar desde el celular?

1. En Telegram, buscá `@BotFather` → `/newbot` → seguí los pasos → te da un token.
2. Guardá el token como variable de entorno:

```bash
setx TELEGRAM_BOT_TOKEN "tu_token"
```

3. Cualquier mensaje o link que le envíes al bot llega a `Inbox/Telegram/`:

```bash
bash ATLAS/scripts/telegram-pull.sh   # jala lo nuevo + limpia lo procesado
```

> El bot borra automáticamente los mensajes ya procesados. Para links de
> **páginas públicas** basta el share normal; para **perfiles privados** usá el
> link directo del reel (`facebook.com/reel/ID`): los shares de perfil expiran.

### ¿Cómo activo la búsqueda semántica (por significado)?

```bash
setx GEMINI_API_KEY "tu_key_de_google_ai_studio"   # gratis en aistudio.google.com
bash ATLAS/scripts/recall-semantic.sh --full         # construye el índice (una vez)
bash ATLAS/scripts/recall-semantic.sh "tu pregunta natural"
```

### ¿Cómo me respaldo en GitHub?

```bash
bash ATLAS/scripts/backup-setup.sh   # te guía: repo privado + primer push
bash ATLAS/scripts/backup.sh         # respaldo manual (notas + sesiones)
```

O dejá que la rutina diaria lo haga (`daily.sh`), programada a las 06:00.

### ¿Los shares de Facebook que mando a veces dicen "eliminado"?

Sí — y no es un error tuyo. Los links `share/r/...` de perfil expiran o el
contenido se borra. El sistema lo detecta y lo marca honestamente en la nota
(`DELETED`). La regla de oro: **link directo del reel** (`reel/ID`) siempre
funciona; **share de perfil** muere; **share de página pública** casi siempre funciona.

### ¿Mis datos van a algún lado?

- Tu vida (notas + sesiones) → solo a tu repo **privado** (el que configures).
- El repo público de la plantilla **jamás** recibe contenido personal.
- La transcripción de videos usa Google Gemini: solo el audio del video que vos
  mandaste, nunca tus notas.
- Tu sesión de Facebook vive en tu disco local (perfil AtlasAgent).

### ¿Necesito saber programar?

No. Todo se dispara con frases al agente (`/jalar`, `/inbox`, `/backup`,
`/recordar`, `/indexar`) o con doble clic en scripts. Si algo falla, el sistema
lo dice claro — y este vault es tuyo: podés preguntarle al agente cómo funciona
cualquier parte.

## Licencia

MIT — usa, cambia y comparte.