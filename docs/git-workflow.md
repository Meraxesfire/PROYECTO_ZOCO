# Git Workflow — Guía práctica (rama → PR → merge)

Guía para trabajar con git en este repo sin romper nada. `main` es producción (despliega en Vercel) y está protegido.

## Reglas de oro

- **Nunca** commitees ni pushees directamente a `main`. Solo se integra vía Pull Request.
- **Nunca** force-push (`git push --force`). GitHub lo bloquea, pero no lo intentes.
- Todo cambio sigue el mismo circuito: rama corta → PR → CI verde → merge.
- Los agentes (opencode) tienen `permission.bash` con estas reglas: push a `main` y force-push = **deny**; el resto de git = **ask**.

## Configuración de protección de `main` (estado actual)

Se configuró como **branch protection rule** (Settings → Branches → Protect matching branches):

- ✅ **Require a pull request before merging** — nadie puede pushear directo a `main`; todo pasa por PR.
- ✅ **Require status checks to pass before merging** → check `ci` obligatorio.
- ✅ **Require branches to be up to date before merging**.
- ✅ **Block force pushes**.
- ⚠️ **Required approvals = 0** — se desactivó la aprobación de al menos 1 persona.

> **Por qué approvals = 0:** GitHub no permite que el autor apruebe su propio PR, y la casilla
> *"Allow the PR author to approve their own pull request"* **solo existe en rulesets** (Settings → Rules),
> no en la branch protection clásica. Para un proyecto en solitario, requerir 1 aprobación bloquea el merge
> para siempre. La protección clave (PR obligatorio + CI verde) se mantiene intacta.

## El circuito completo (paso a paso)

### 1. Crear la rama

Desde `main`, con los cambios locales sin commitear (se montan solos en la rama):

```powershell
git checkout -b feature/nombre-descriptivo
```

### 2. Decidir qué se sube y commitear

```powershell
git status
git add <archivos>
git commit -m "Descripción breve del cambio"
```

Para apartar cambios no relacionados del PR: `git stash` (recuperar luego con `git stash pop`).

### 3. Subir la rama

```powershell
git push -u origin feature/nombre-descriptivo
```

> Push normal a una rama de feature es seguro y permitido. Solo `main` está bloqueado.

### 4. Crear el PR (web)

1. GitHub ofrece el botón **Compare & pull request** tras el push (o Pull requests → New pull request).
2. Comprobar que diga `base: main ← compare: feature/nombre-descriptivo`.
3. Descripción corta indicando qué hace y qué Criterios de Aceptación (CA) cubre si aplica a una spec.
4. **Create pull request**.

### 5. Esperar el CI

El workflow `.github/workflows/ci.yml` corre el job `ci` contra el PR. Debe quedar **verde**. Si falla, corrige en la rama y vuelve a pushear (el CI se relanza solo).

### 6. Merge y limpieza

```powershell
# En la web:
#   Merge pull request → Confirm merge → (opcional) borrar la rama

# En la terminal:
git checkout main
git pull
```

Si usaste `git stash`, ahora: `git stash pop`.

## Qué hace exactamente el CI (el "verde")

Secuencia de `.github/workflows/ci.yml` (si un paso falla, se detiene y el check queda rojo):

| Paso | Comando | Qué caza |
|---|---|---|
| Checkout | — | Descarga el código en una máquina limpia (Ubuntu) |
| Setup Node 22 | — | Instala Node y reutiliza caché de npm |
| Install | `npm ci` | Instala **exactamente** lo de `package-lock.json` (mismas versiones para todos) |
| Type check | `npm run check` | `astro check`: errores de tipos, variables sin usar, imports rotos |
| Tests | `npm run test` | `vitest run`: los tests unitarios y de render (el motor del harness SDD) |
| Build | `npm run build` | `astro build`: compila el sitio y empaqueta las funciones server de Vercel |

- Cada comando caza un tipo distinto de error: tipos (estático), lógica (comportamiento), integración (build).
- En el PR se ve como **"CI / ci (pull_request)"** — el `(pull_request)` es el evento que lo disparó. Al lado aparece **"Required"**: es la check obligatoria de la branch protection.
- **Verde** = el código que vas a mergear a producción ha pasado tipos + tests + build en una máquina limpia.

## Gotchas aprendidos

- **No puedes aprobar tu propio PR.** GitHub deshabilita "Approve" para el autor. La casilla de auto-aprobación es solo de rulesets (Settings → Rules), no de la branch protection clásica. Por eso approvals = 0.
- Si algún día quieres volver a la aprobación obligatoria en solitario: migra la regla a un **ruleset** y marca *"Allow the PR author to approve their own pull request"* (manteniendo Required approvals = 1). Borra la branch protection rule antigua para evitar reglas contradictorias.
- `npm ci` requiere `package-lock.json` actualizado; si cambias `package.json`, ejecuta `npm install` antes.
- Los cambios del ruleset/branch protection se aplican desde GitHub (web), no desde el repo.
