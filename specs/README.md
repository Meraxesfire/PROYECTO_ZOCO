# Specs — Spec-Driven Development

Cada funcionalidad se describe primero aquí, antes de implementarla. La spec define **qué** debe hacer el sistema; los tests demuestran que se cumple.

## Estructura de una spec

```md
# <Nombre de la funcionalidad>

## Objetivo
<Qué hace esta funcionalidad, en 1-2 frases>

## Contexto
<De dónde sale, qué dependencias usa, archivos implicados>

## Escenarios
Cada caso en formato GIVEN / WHEN / THEN:

- **GIVEN** <estado previo>
  **WHEN** <acción>
  **THEN** <resultado esperado>

## Criterios de aceptación
- **CA-1** <afirmación comprobable>
- **CA-2** <afirmación comprobable>
…
```

## Convención spec → test

- El test que verifica cada CA vive en `src/**/<archivo>.test.js`.
- El `describe`/`it` del test referencia la CA de la spec que cubre (ej.: `describe('getGafas (specs/catalogo.md CA-1)')`).
- Regla: **spec sin test = tarea incompleta.** Si una CA no tiene test, no se mergea.
- El CI (`npm run test`) ejecuta todos los tests en cada PR.

## Cómo trabajar con una spec

1. Lee la spec completa antes de implementar.
2. Implementa el mínimo necesario para cumplir los CAs.
3. Escribe/actualiza los tests que demuestran cada CA.
4. `npm run check` + `npm run test` + `npm run build` en verde.
5. PR describiendo qué CAs cubre.
