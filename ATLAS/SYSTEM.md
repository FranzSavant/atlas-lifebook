---
tipo: sistema
id: SYSTEM
nivel: 0
parent: "[[ATLAS]]"
fecha: 2026-09-08
descripcion: "Reglas vivas del sistema Atlas — cómo se mueve, rutea y persiste."
utilidad: "Verdad operativa del fractal. Si cambias de app, este archivo sigue mandando."
percepcion: "ATLAS percibe SYSTEM como su manual vivo."
---

# SYSTEM — Reglas Vivas Atlas LifeBook + GTD Fractal

> Fuente de verdad operativa. Sobrevive a Maestri. Todo lo que está aquí se ejecuta.

## 1. Sistema
- **12 especialistas** con nombres propios: Axel (Salud), Dante (Intelecto), Kai (Emociones), Elias (Espiritualidad), Hugo (Carácter), Damian (Pareja), Abraham (Familia), Nico (Amistades), Leo (Profesión), Victor (Finanzas), Liam (Estilo de Vida), Orion (Visión)
- **3 coordinadores:** SER (Axel/Dante/Kai/Elias), VINCULO (Hugo/Damian/Abraham/Nico), OBRA (Leo/Victor/Liam/Orion)
- **1 orquestador:** ATLAS
- **Fractal:** cada carpeta tiene su `.md` homónimo con `parent: "[[Padre]]"` / `contiene: "[[Hijo]]"` clickeable. Todo es `.md`, todo tiene `fecha/id/descripcion/utilidad/percepcion` + `parent/contiene`.

## 2. Persistencia
Markdown manda. Maestri solo lee/escribe `.md`. Si cambias de app, te llevas `Atlas/` y sigue vivo.

## 3. GTD Fractal
- Cada especialista tiene su universo `.../Axel-GTD/` con `Accionable/` (Proyectos, Próximas acciones, Calendario, Flash, Delegadas) y `No accionable/` (Algún día, Referencia, Papelera, Incubar)
- Taxonomías globales en `GTD/Energy Levels/` (Flow, Active, Flat, Numb, Zombie) y `GTD/Contexts/` (shopping, oficina, casa, apartamento, pc, cel)
- Plantillas centrales en `GTD/Templates/` (Proyecto, ProximaAccion, Calendario, Flash, Delegada, AlgunDia, Referencia, Incubar) — verdad única, se replica con óptica Nivel 2

## 4. Regla Viva de Ruteo — 3 Modos (Francisco)

**Modo 1 — Vía ATLAS (difuso/multi-agente):**
Tú hablas con `ATLAS` cuando lo que traes puede tocar a varios. ATLAS detecta, rutea a `SER/VINCULO/OBRA`, ellos a sus `Axel/Dante...` hasta que el `.md` viva donde debe con la óptica correcta.

**Modo 2 — Directo a especialistas (quirúrgico):**
Tú hablas directo a `Axel`, `Leo` o `Axel+Leo` cuando ya sabes que es solo de ellos. Te ahorras ATLAS y coordinador. `maestri ask "Axel" "..."`

**Modo 3 — Vía coordinador (por grupo):**
Tú hablas con `SER`, `VINCULO` u `OBRA` y él rutea solo a sus 4. Para trabajo de un grupo entero. `maestri ask "SER" "..."`

> Los 3 modos coexisten. El fractal `parent: [[...]]` asegura que el `.md` siempre acabe donde toca, con `descripcion/utilidad/percepcion` generada por la óptica del Nivel 2 que lo crea.

## 5. Metadatos Base (todo .md)
- `fecha`, `id` — sistema
- `descripcion`, `utilidad`, `percepcion` — genera el LLM con óptica del Nivel 2 que lo contiene
- `tipo`, `nivel`, `parent`, `contiene`, `contexto`, `energia` — fractal clickeable

## 6. Statement — privado por diseño (regla viva)
- Cada especialista tiene **dos archivos**: `X.md` (identidad del agente, pública) y `X-Statement.md` (la voz de Francisco sobre esa área, **privada**).
- `X-Statement.md` lleva `privado: true` y las preguntas del LifeBook (Butcher): Premisa, Visión, Misión/Propósito, Metas, Estrategias, Plan de acción.
- El agente lee ambos: la identidad para saber quién es y el Statement para trabajar con la visión real de Francisco.
- **Nunca se publica un `*-Statement.md` en el repo público** — el script `publish-public.sh` solo publica lo que está en su manifest, y los Statement quedan fuera por diseño.
- El repo privado `atlas-backup` es el respaldo completo (backup diario 21:00). El repo público `atlas-lifebook` es la marca blanca: solo identidades, estructura, plantillas y scripts.

---
*Regla viva — se actualiza conversando. Ver `AGENTS.md` para fichas de cada agente y `PLAN.md` para historia.*
