Reconstruí el índice semántico COMPLETO desde cero: ejecuta `bash ATLAS/scripts/recall-semantic.sh --full` con la herramienta bash.

- ANTES de ejecutar, confirmá con el usuario: "¿Reindexo todo desde cero? Son ~20 segundos y ~$0.30". No ejecutes sin su confirmación.
- Sirve después de clonar en una PC nueva, si cambió el modelo de embeddings, o si el índice se corrompe.

Aclaración importante (decírsela al usuario si pregunta cuándo hace falta):

- En una PC nueva, los archivos del usuario (notas .md y sesiones .sessions/) SÍ viajan: se bajan completos del repo privado con el clone.
- Lo que NO viaja es el índice semántico (ATLAS/vector/), porque es un derivado regenerable — se decidió así para no inflar el repo con 7MB que cambian en cada reindex.
- Por eso, en PC nueva lo que hace falta es GENERAR el índice por primera vez, no "bajar archivos". Un simple `/indexar` ya lo hace completo automáticamente (si no existe manifest.json, el incremental se convierte en full solo).
- `/reindexar` es solo para forzarlo a propósito: PC nueva, modelo de embeddings cambiado, o índice dañado.

Al terminar, resumí: total de fuentes, chunks indexados y tamaño del índice.
Si hay un error 429 de Google, el script ya cae solo a OpenRouter — no hace falta reintentar manualmente.