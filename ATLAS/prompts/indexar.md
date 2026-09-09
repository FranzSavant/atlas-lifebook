Actualizá el índice semántico de forma INCREMENTAL (solo lo que cambió): ejecuta `bash ATLAS/scripts/recall-semantic.sh --index` con la herramienta bash.

- Es rápido y casi gratis: detecta por hash qué notas/sesiones cambiaron y re-embedea solo eso; lo que no cambió conserva sus vectores.
- Si el índice no existe todavía (primera vez o PC nueva), corré `--full` en su lugar y avisá que fue la primera indexación.
- Al terminar, resumí: cuántos chunks se conservaron, cuántos se indexaron nuevos y el total del índice.
- Si hay un error 429 de Google, el script ya cae solo a OpenRouter — no hace falta reintentar manualmente.
