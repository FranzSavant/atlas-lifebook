Actualizá el índice semántico de forma INCREMENTAL (solo lo que cambió): ejecuta `bash ATLAS/scripts/recall-semantic.sh --index` con la herramienta bash.

- Es rápido y casi gratis: detecta por hash qué notas/sesiones cambiaron y re-embedea solo eso; lo que no cambió conserva sus vectores.
- Si el índice no existe todavía (primera vez, PC nueva o clon reciente), el script hace el completo automáticamente — avisá que fue la primera indexación (~20 segundos).
- En PC nueva no hace falta ninguna preparación: los archivos (notas + sesiones) ya vienen del repo privado al clonar; solo falta generar el índice local, y este comando lo hace.
- Al terminar, resumí: cuántos chunks se conservaron, cuántos se indexaron nuevos y el total del índice.
- Si hay un error 429 de Google, el script ya cae solo a OpenRouter — no hace falta reintentar manualmente.