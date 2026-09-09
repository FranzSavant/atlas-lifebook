Procesá el Inbox de GTD: ejecuta `bash ATLAS/scripts/inbox-scan.sh` con la herramienta bash.

- Lista los archivos nuevos en `Inbox/` (cualquier tipo: .md, .txt, .pdf, .png, .jpg, .url...). El scan clasifica por contenido los de texto; para imágenes/PDF usa el nombre como pista PERO vos mirá el contenido real (sos multimodal) antes de rutear.
- Ruteá cada item al agente correcto (el de mayor puntaje; si hay empate o todo es bajo (<0.45), preguntale al usuario).
- Creá el archivo real en el universo GTD del agente según el tipo:
  - Flash (<2 min) → `{Area}-GTD/Accionable/Flash/`
  - Próxima acción (>2 min) → `{Area}-GTD/Accionable/Próximas acciones/`
  - Proyecto multietapa → `{Area}-GTD/Accionable/Proyectos/`
  - Con fecha/hora → `{Area}-GTD/Accionable/Calendario/` (fecha en frontmatter)
  - Referencia/información → `{Area}-GTD/No accionable/Referencia/`
  - Algún día/quizás → `{Area}-GTD/No accionable/Algún día/`
  Usá el frontmatter de las plantillas de `ATLAS/GTD/Templates/` (Proyecto.md, ProximaAccion.md, Calendario.md, Referencia.md, Flash.md) para el archivo creado.
- Mové el original a `Inbox/Procesado/<fecha> - <nombre>`.
- Al final, resumí qué rutaste a qué agente y confirmá que el Inbox quedó vacío (o qué quedó pendiente y por qué).