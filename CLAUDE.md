# ZOCO Eyewear — Guía para agentes

> Web de ZOCO®, tienda de gafas y óptica de **ISPAL EYEWEAR SL** (Sevilla). Producción: https://www.zocoeyewear.com
> Lee `arch.md` para la arquitectura completa y `specs/` para las especificaciones de funcionalidades.

## Stack

- **Astro 7** (modo `server`) + adaptador **Vercel** (ISR 5 min, excluye `/api/*`).
- **Supabase** (Postgres): tablas `gafas` y `tiendas`.
- **GROQ** (`llama-3.3-70b-versatile`): chatbot en `POST /api/chat`.
- **Vitest**: tests unitarios y de render de componentes.
- **GitHub Actions**: CI (`npm run check` + `npm run test` + `npm run build`).

## Reglas de producción (no negociables)

- `main` **es producción** y despliega en Vercel. Está protegido por un ruleset de GitHub.
- **PROHIBIDO** commitear o pushear directamente a `main`. **PROHIBIDO** force-push. Aunque el ruleset lo bloquea, nunca lo intentes.
- Todo cambio va por: rama corta → PR → CI verde + aprobación → merge.
- **Nunca tocar `.env`** ni exponer secretos (la API key de GROQ solo vive en servidor).
- Pedir permiso antes de modificar `src/styles/**`, `src/layouts/**` y `astro.config.mjs` (opencode ya lo exige).

## Workflow (Spec-Driven Development)

1. **Lee la spec**: cada funcionalidad tiene una en `specs/*.md` (formato en `specs/README.md`).
2. **Planea**: antes de escribir código, expón el plan y qué Criterios de Aceptación (CA) cubre.
3. **Implementa** el mínimo necesario para cumplir la spec.
4. **Prueba**: cada CA debe quedar demostrado por un test en `src/**/*.test.js` que lo referencie (spec sin test = tarea incompleta).
5. **Verifica**: `npm run check`, `npm run test` y `npm run build` en verde.
6. **PR**: rama corta y descripción indicando qué CAs cubre.

## Comandos

| Comando | Acción |
|---|---|
| `npm run dev` | dev server |
| `npm run check` | astro check (tipos) |
| `npm run test` | vitest |
| `npm run build` | build de producción |
| `npm run preview` | previsualizar el build |

## Skills del proyecto

- `seo-check` — **obligatorio** al crear o editar una página Astro o el `head` de un layout (SEO, metas, canonical, Open Graph). Respeta el script de Cookiebot.
- `frontend-design` — **opt-in**: solo se usa si el usuario pide explícitamente un diseño nuevo o un rediseño.

## Memoria (Engram)

Guarda en la memoria del proyecto las decisiones, bugs y descubrimientos relevantes para que las próximas sesiones partan con contexto.
