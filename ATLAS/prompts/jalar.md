Jalá lo que le hayas escrito al bot de Telegram: ejecuta `bash ATLAS/scripts/telegram-pull.sh` con la herramienta bash.

- Baja los mensajes nuevos (texto, links, reenvíos de Facebook/YouTube) del bot `@franz_savant_inbox_bot` a `Inbox/Telegram/`.
- Cada mensaje se convierte en un archivo `.md` de captura **enriquecido**:
  - YouTube → título real (oEmbed)
  - Facebook o cualquier web → contenido real leído por el LLM (Jina Reader)
  - Privado/restringido → marcado `[PRIVADO/RESTRINGIDO - preguntar al dueño]`
- Después procesar como un inbox más (`/inbox`): clasificar con `inbox-scan.sh` y rutear al agente correcto.
- Al final, corré el cleanup: `bash ATLAS/scripts/telegram-pull.sh --cleanup` para borrar de Telegram los ya procesados.
- Si un link quedó marcado privado, preguntale al usuario qué es antes de rutearlo.