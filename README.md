# ZOCO Eyewear

Sitio web de ZOCO®, tienda de gafas y óptica de **ISPAL EYEWEAR SL** (Sevilla).
Producción: https://www.zocoeyewear.com

## Stack

- **Astro 7** (server output) + **Vercel** (ISR 5 min, excluye `/api/*`)
- **Supabase** (Postgres): tablas `gafas` y `tiendas`
- **GROQ** (`llama-3.3-70b-versatile`): chatbot en `/api/chat`
- **Vitest**: tests unitarios y de render
- **GitHub Actions**: CI

## Requisitos

- Node >= 22.12
- Variables en `.env`:
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`
  - `GROQ_API_KEY` (solo servidor, sin prefijo `PUBLIC_`)

## Comandos

| Comando | Acción |
|---|---|
| `npm install` | instala dependencias |
| `npm run dev` | dev server en `localhost:4321` |
| `npm run build` | build de producción a `./dist/` |
| `npm run preview` | previsualizar el build |
| `npm run check` | astro check (tipos) |
| `npm run test` | vitest |
| `npm run astro ...` | CLI de Astro |

## Desarrollo guiado por specs (SDD)

- Cada funcionalidad se especifica en `specs/` (formato en `specs/README.md`).
- Cada Criterio de Aceptación (CA) debe estar cubierto por un test en `src/**/*.test.js`.
- El CI corre los tests en cada PR: CI rojo = no se mergea.

## Ramas y producción

- `main` es producción (despliega en Vercel) y está protegido por una **branch protection rule**: PR obligatorio + CI verde (`ci`), sin push directo ni force-push.
- **No se commitea ni se pushea directo a `main`.** Todo cambio va por rama corta + PR (CI verde) → merge.
- Guía práctica paso a paso: `docs/git-workflow.md`.

## CI

`.github/workflows/ci.yml` ejecuta en cada PR y push a `main`: `npm run check` → `npm run test` → `npm run build`.

## Estructura

```
src/
├── components/   # Componentes Astro (SeoHead, GafaCard, ChatWidget, headers/footers…)
├── layouts/      # Layouts (Landing, Catalog, FooterPages…)
├── lib/          # Lógica pura + cliente Supabase
├── pages/        # Rutas (.astro + /api/chat.ts)
├── services/     # Acceso a datos (gafas.js, stores.js)
└── styles/       # CSS global + por página
```

Detalles en `arch.md`.
