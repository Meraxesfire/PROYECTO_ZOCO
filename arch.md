# ZOCO Eyewear — Arquitectura

Documento de referencia para agentes. Describe qué hace el proyecto, cómo está estructurado y las decisiones clave. Lee `AGENTS.md` para las reglas de trabajo y `specs/` para las funcionalidades.

## Visión general

Sitio web de ZOCO®, tienda de gafas y óptica de **ISPAL EYEWEAR SL** (Sevilla).

- **Producción:** https://www.zocoeyewear.com (Vercel, se despliega desde `main`).
- **Repo:** `Meraxesfire/PROYECTO_ZOCO`.

## Stack

| Capa | Tecnología | Notas |
|---|---|---|
| Framework | Astro 7 | `output: 'server'` |
| Deploy | Vercel (`@astrojs/vercel`) | ISR: `expiration: 300` (5 min), excluye `/api/*` |
| Base de datos | Supabase (Postgres) | tablas `gafas` y `tiendas` |
| Chat IA | GROQ — `llama-3.3-70b-versatile` | endpoint `POST /api/chat` |
| Tests | Vitest | unitarios + render de componentes (`astro/container`) |
| CI | GitHub Actions | `.github/workflows/ci.yml`: check + test + build |
| SEO | `@astrojs/sitemap` + `SeoHead.astro` | `public/robots.txt` referencia el sitemap |

## Estructura

```
src/
├── components/     # Componentes Astro (SeoHead, GafaCard, ChatWidget, headers/footers…)
├── layouts/        # Layouts (Landing, Catalog, FooterPages…)
├── lib/            # Lógica pura + cliente Supabase
│   ├── supabase.js # Cliente Supabase (env PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY)
│   └── format.js   # Formateo gafas/tiendas → texto (usado por el chatbot)
├── pages/          # Rutas (.astro + /api)
│   └── api/chat.ts # Endpoint del chatbot
├── services/       # Acceso a datos
│   ├── gafas.js    # getGafas(limit), getGafaPorId(id)
│   └── stores.js   # (pendiente de implementar)
└── styles/         # CSS global + por página
```

## Flujos clave

### Catálogo de gafas
- `src/services/gafas.js` consulta la tabla `gafas` (Supabase).
- `getGafas(limit = 12)` → lista de gafas. Devuelve `[]` si hay error (la web no se rompe).
- `getGafaPorId(id)` → detalle. Devuelve `null` si no existe o hay error (la página deriva a 404).
- UI: `optical.astro`, `sun.astro`, `gafas/[slug].astro`, `CatalogBody.astro`, `GafaCardComponent.astro`.
- Spec: `specs/catalogo.md`.

### Chatbot (GROQ)
- `ChatWidget.astro` envía `POST /api/chat` con `{ mensajeUsuario, historial }`.
- `src/pages/api/chat.ts` carga gafas y tiendas de Supabase, las formatea con `src/lib/format.js`, las inyecta en un system instruction (datos de empresa, envíos, FAQ, términos, privacidad, cookies, empleo) y llama a GROQ.
- **Seguridad:** `GROQ_API_KEY` NO lleva prefijo `PUBLIC_` → solo visible en servidor.

### Contacto (Web3Forms)
- Formulario client-side con honeypot + temporizador anti-spam. Cloudflare Turnstile se descartó por coste (límite de emails gratuitos).

### SEO
- Cada página usa `SeoHead.astro` (título `ZOCO eyewear | …`, description ≤ 160, canonical, Open Graph/Twitter).
- `gafas/[slug]` NO está en el sitemap hasta que implemente `getStaticPaths`.

## Variables de entorno (`.env`)

| Variable | Ámbito | Uso |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | cliente | Supabase |
| `PUBLIC_SUPABASE_ANON_KEY` | cliente | Supabase |
| `GROQ_API_KEY` | servidor (sin `PUBLIC_`) | chatbot |

El CI inyecta las tres desde los secrets de GitHub.

## Decisiones y deuda técnica

- **GROQ API key:** renovar en julio 2027 (el chatbot deja de responder si caduca).
- **Contacto client-side:** por el límite de emails gratis de Web3Forms.
- **`src/services/stores.js`:** vacío/pendiente; `formatearTiendas` ya existe en `format.js`.
- **`main` = producción:** protegido por ruleset de GitHub; solo se integra vía PR con CI verde.

## Reglas para agentes

Ver `AGENTS.md`: producción, workflow SDD, comandos y guardrails.
