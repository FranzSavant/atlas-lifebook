# PLAN — Atlas LifeBook + GTD Fractal
> Artifact plan hasta sesión 2026-09-07 | Filosofía: todo es .md, todo tiene metadatos, todo tiene dataview | Fuente de verdad: markdown en disco, Maestri solo ejecuta

## 1. Filosofía acordada
- **12 categorías LifeBook variantes estrechas** (no creativas): Salud, Intelecto, Emociones, Espiritualidad, Carácter, Pareja, Familia, Amistades, Profesión, Finanzas, Estilo de Vida, Visión.
- **3 grupos:** SER (Interior), VÍNCULO (Relaciones), OBRA (Manifestación). ATLAS orquesta, Visión integra.
- **3 niveles:** 0 ATLAS (orquestador), 1 Coordinadores (SER/VINCULO/OBRA), 2 Especialistas (12). Cada .md explica que es agente y su relación con el todo (sin jerga familia en archivos).
- **Sin números en carpetas.** Cada entidad tiene su carpeta y su `.md` homónimo.
- **Persistencia:** markdown manda. Maestri lee/escribe .md. Si cambias de app, sobrevive.
- **GTD por especialista:** cada Nivel 2 tiene su propio universo GTD fractal. La IA organiza, Francisco solo captura.
- **Todo es nodo:** cada valor (ej. energia: active) es también un `.md` con metadatos + dataview que agrupa.

## 2. Estructura actual en disco (ya materializada)
```
Atlas/
  ATLAS.md (orquestador, Nivel 0)
  PLAN.md (este archivo)
  SER/
    SER.md (coordinador)
    Salud/Salud.md, Intelecto/Intelecto.md, Emociones/Emociones.md, Espiritualidad/Espiritualidad.md
  VINCULO/
    VINCULO.md
    Caracter/Caracter.md, Pareja/Pareja.md, Familia/Familia.md, Amistades/Amistades.md
  OBRA/
    OBRA.md
    Profesion/Profesion.md, Finanzas/Finanzas.md, Estilo de Vida/Estilo de Vida.md, Vision/Vision.md
```
- Cada .md ya incluye frontmatter `tipo/nivel/sistema/id/parent/coordinador` y sección `Relación con el todo` + plantilla LifeBook (Premisa/Visión/Propósito/Estrategia + Estado + Próxima acción).
- Maestri: ATLAS maestro, SER/VINCULO/OBRA maestros temporales, 12 especialistas con nombres estrechos correctos. `maestri list` verificado árbol limpio sin cuerda al abuelo.

## 3. GTD fractal acordado (a materializar ahora)
**Por cada especialista (12x):**
```
Especialista/
  Accionable/
    Accionable.md (índice, parent [[Especialista]])
    Proyectos/Proyectos.md → cada proyecto es .md con proposito/resultado/directrices + referencia a proxima_accion en [[Próximas acciones]]/[[Calendario]]/[[Flash]]/[[Delegadas]]
    Próximas acciones/Próximas acciones.md
    Calendario/Calendario.md
    Flash/Flash.md (<2min)
    Delegadas/Delegadas.md (en espera)
  No accionable/
    No accionable.md
    Algún día/Algún día.md
    Referencia/Referencia.md
    Papelera/Papelera.md
    Incubar/Incubar.md
```
- **Organización:** la IA decide dónde va cada captura (no Francisco).
- **Contextos y energia como YAML tags** en cada acción/proyecto, no carpetas. `contexto: @calle/@pc` etc.
- **Energia 5 valores:** flow, active, flat, numb, zombie (flat en vez de calm). Taxonomía global en `ATLAS/GTD/Energy Levels/`.

**Taxonomía global GTD (robusta):**
```
ATLAS/GTD/
  GTD.md
  Energy Levels/
    Energy Levels.md
    Flow.md, Active.md, Flat.md, Numb.md, Zombie.md (cada uno con descripción + dataview WHERE energia = [[Active]] )
```
- Futuro: replicar para Contexts, etc., bajo `GTD/`.

**Folder notes:** cada carpeta tiene su `.md` homónimo con frontmatter heredado (`sistema, nivel, id, parent: "[[Padre]]", coordinador, especialista, ruta`) + dataview que lista hijos. Breadcrumbs vía `parent`.

## 4. Ejecución pendiente (este plan)
1. Crear 12x GTD universos fractales (132 carpetas/.md índice)
2. Crear ATLAS/GTD/Energy Levels con 5 nodos + índices
3. Actualizar 12 .md de especialistas para que su dataview liste su universo GTD
4. Verificar en Obsidian con Ctrl+R

## 5. Próximos pasos conversados (no ejecutar aún)
- Definir estructura de proyecto .md (proposito/resultado/directrices + proxima_accion referencia)
- Definir taxonomía Contexts global
- Dashboard ATLAS que agregue todos los universos (Dataview global)

---

## 6. Decisiones de sesiones 2026-09-08/09 (ya materializadas)

### 6.1 Arquitectura Statement (público vs privado)
- Cada especialista tiene `X.md` (identidad de agente, **pública**) y `X-Statement.md`
  (`privado: true`, voz personal con las preguntas originales del LifeBook Butcher:
  Premisa → Visión → Misión → Metas → Estrategias → Plan de acción).
- El agente lee ambos; el público jamás ve el Statement.

### 6.2 Repositorios separados (usuario GitHub: FranzSavant)
- **Público** `atlas-lifebook`: marca blanca / plantilla congelada. Publicación por
  manifest whitelist (`publish-public.sh`) — nunca `git add .` del privado.
- **Privado** `atlas-backup`: origin real del vault, respaldo total.
- **Regla:** ¿es tu vida? → `/backup`. ¿Es mejora de plantilla/sistema? → `/publicar`.
- Backup automático diario 21:00 (Task Scheduler Windows → `backup.sh`).

### 6.3 Sesiones archivadas (para la eternidad)
- `backup.sh` copia las sesiones de Pi a `.sessions/` dentro del vault (git-tracked,
  viaja al privado), con nombres legibles (Atlas, Axel, Ser, ...) resueltos desde `role.json`.
- `session-search.sh` / prompt `/recordar` buscan en `.sessions/` — funcionan en PC
  nueva tras clonar.
- `recall.sh`: búsqueda unificada del agente en notas + sesiones a la vez (memoria).

### 6.4 Memoria del agente (`AGENTS.md` en la raíz)
- Se carga al iniciar sesión: el agente busca con `recall.sh` antes de responder,
  cita la fuente si existe, y dice honestamente "no tengo nada guardado" si no.
- Verifica `backup-status.sh` al iniciar: si no hay respaldo, ofrece configurarlo
  (`backup-setup.sh`); si hay OK, no molesta.
- Scripts genéricos (sin usuario hardcodeado) → funcionan para quien clone.

### 6.5 Inicio minimalista → 12 (flujo 4→12)
- Bootstrap crea 4 terminales (ATLAS + Ser/Vinculo/Obra). Los 12 especialistas
  nacen solo si Francisco promueve a maestro y corre `/crear-12` desde ATLAS.

### 6.6 Limpieza Gentle (2026-09-09)
- Eliminados: Engram, pi-mcp-adapter, pi-web-access, mcp.json.
- Conservados: gentle-ai.exe, Go 1.27, gentle-pi (persona el Gentleman, skills,
  orquestador), rpiv-ask-user-question, pi-btw. Skills meta usan espejo `ATLAS/skills/`.

### 6.7 Dualidad Maestri ⇄ Pi (2026-09-09)
- Los 15 agentes viven en DOS mundos idénticos: Maestri (`role.json`/AGENTS.md)
  y Pi subagentes (`.pi/agents/*.md` — descubiertos automáticamente por Pi).
- `sync-agents.sh`: bidireccional, EL MÁS NUEVO GANA, probado en ambas direcciones.
- `daily.sh` (tarea 06:00 hora El Salvador): skills + agentes + backup GitHub.
  StartWhenAvailable: si la PC está apagada, corre al encenderse.
- El contenido de los agentes (X.md, Statement, GTD) es la misma fuente de verdad
  en ambos mundos; solo la cáscara de prompt se sincroniza.

### 6.8 Próximos pasos personales (de Francisco)
- Completar los 12 `*-Statement.md` con sus respuestas LifeBook privadas.
- Crear contenido GTD real en los universos.

---
*Actualizado 2026-09-09. Sistema durable: vida + charlas respaldadas, memoria de agente integrada.*
