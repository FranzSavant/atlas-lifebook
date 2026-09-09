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
*Plan generado 2026-09-07. Filosofía capturada. Listo para ejecutar.*
