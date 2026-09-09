---
tipo: inbox
nivel: 0
id: INBOX
fecha: 2026-09-09
descripcion: "Puerta de entrada GTD — captura rápida sin pensar."
utilidad: "Todo lo que aún no sabés qué es, vive aquí hasta que Atlas lo rutee."
percepcion: "SER/VINCULO/OBRA perciben el Inbox como material crudo pendiente de clasificar."
parent: "[[ATLAS]]"
---

# INBOX — Captura rápida (GTD)

> **La única regla: si no sabés qué es todavía, va acá.** No lo clasifiques,
> no lo ordenes, solo soltalo. Atlas (o la rutina diaria) lo rutea después.

## Cómo capturar

**Opción 1 — archivo suelto:** arrastrá o creá un `.md` en esta carpeta con
lo que sea: una idea, un nombre, un recordatorio, un link, un correo.

**Opción 2 — nota rápida desde Obsidian:** `Ctrl+N` con plantilla
`ATLAS/GTD/Templates/Inbox.md` (viene con el sistema).

**Opción 3 — con la voz (Pi):** cuando hablás con Atlas y mencionás algo
"para después", Atlas puede crear el archivo acá directamente.

## Qué pasa después (procesamiento)

1. **Scan**: `bash ATLAS/scripts/inbox-scan.sh` (o la rutina de las 06:00)
   detecta el archivo nuevo y lo **clasifica por semántica**: ¿es de Salud,
   Finanzas, Pareja...? (elige el dominio con mayor similitud).
2. **Ruteo**: Atlas crea el archivo real en el universo GTD del agente
   correcto, según su tipo:
   - **Tarea** → `{Area}-GTD/Accionable/Próximas acciones/` o `Flash/` (<2 min)
   - **Proyecto** → `{Area}-GTD/Accionable/Proyectos/`
   - **Calendario** → `{Area}-GTD/Accionable/Calendario/` (con fecha)
   - **Referencia** → `{Area}-GTD/No accionable/Referencia/`
   - **Algún día** → `{Area}-GTD/No accionable/Algún día/`
3. **Archivado**: el archivo original del Inbox se mueve a
   `Inbox/Procesado/` con la fecha (historial de captura).

## Reglas vivas

- Lo que está en Inbox es **material crudo**: se puede borrar sin drama.
- Una vez procesado, el archivo real vive en el GTD del agente; el Inbox solo
  guarda el rastro en `Procesado/`.
- Si el scan no clasifica bien (dominios todos bajos), Atlas te pregunta —
  nunca adivina.