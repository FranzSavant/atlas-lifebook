Reconstruí el índice semántico COMPLETO desde cero: ejecuta `bash ATLAS/scripts/recall-semantic.sh --full` con la herramienta bash.

- ANTES de ejecutar, confirmá con el usuario: "¿Reindexo todo desde cero? Son ~20 segundos y ~$0.30·". No ejecutes sin su confirmación.
- Sirve tras clonar en una PC nueva, si cambió el modelo de embeddings, o si el índice se corrompió.
- Al terminar, resumí: total de fuentes, chunks indexados y tamaño del índice.
- Si hay un error 429 de Google, el script ya cae solo a OpenRouter — no hace falta reintentar manualmente.