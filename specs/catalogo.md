# Catálogo de gafas

## Objetivo

Mostrar el catálogo de gafas en la web: listar productos y mostrar el detalle de una gafa por su id, sin romper la web cuando la base de datos devuelve errores.

## Contexto

- Datos: tabla `gafas` en Supabase (cliente `src/lib/supabase.js`).
- Servicio: `src/services/gafas.js` → `getGafas(limit)` y `getGafaPorId(id)`.
- UI: `src/components/GafaCardComponent.astro` (tarjeta), `src/components/CatalogBody.astro`, páginas `optical.astro`, `sun.astro`, `gafas/[slug].astro`.
- Tests actuales: `src/services/gafas.test.js`, `src/components/GafaCardComponent.test.js`.

## Escenarios

### Listado

- **GIVEN** hay gafas en Supabase
  **WHEN** se llama a `getGafas(12)`
  **THEN** devuelve hasta 12 gafas tal cual vienen de la base de datos, consultando la tabla `gafas`.
- **GIVEN** Supabase devuelve un error
  **WHEN** se llama a `getGafas()`
  **THEN** devuelve un array vacío (la web no se rompe) y se loguea el error en consola.
- **GIVEN** se pasa un límite distinto
  **WHEN** se llama a `getGafas(5)`
  **THEN** el límite se aplica en la consulta.

### Detalle

- **GIVEN** existe una gafa con el id `abc`
  **WHEN** se llama a `getGafaPorId('abc')`
  **THEN** devuelve esa gafa (busca con `.eq('id', id)` + `.single()`).
- **GIVEN** no existe la gafa o hay un error
  **WHEN** se llama a `getGafaPorId(...)`
  **THEN** devuelve `null` (la página puede redirigir a 404) y se loguea el error.

### Tarjeta (render)

- **GIVEN** una gafa con `portadaImgUrl`, `nombreModelo` y `codigoColorModelo`
  **WHEN** se renderiza `GafaCardComponent`
  **THEN** el HTML contiene el nombre, el código de color y la imagen con su `src` y `alt`.
- **GIVEN** `esNovedad = true`
  **WHEN** se renderiza la tarjeta
  **THEN** aparece el badge `New`.
- **GIVEN** sin `esNovedad` (por defecto)
  **WHEN** se renderiza la tarjeta
  **THEN** NO aparece el badge `New`.

## Criterios de aceptación

- **CA-1** `getGafas(limit)` devuelve los datos que responde Supabase con el límite aplicado → `src/services/gafas.test.js`.
- **CA-2** Si Supabase devuelve error, `getGafas` devuelve `[]` sin lanzar excepción → `src/services/gafas.test.js`.
- **CA-3** `getGafaPorId(id)` busca por `id` (`.eq('id', id)` + `.single()`) y devuelve la gafa → `src/services/gafas.test.js`.
- **CA-4** Si la gafa no existe o hay error, `getGafaPorId` devuelve `null` → `src/services/gafas.test.js`.
- **CA-5** `GafaCardComponent` renderiza nombre, código de color e imagen con `src` y `alt` → `src/components/GafaCardComponent.test.js`.
- **CA-6** Con `esNovedad = true` la tarjeta muestra el badge `New`; sin él, no → `src/components/GafaCardComponent.test.js`.
