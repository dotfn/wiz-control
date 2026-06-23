# Lumus Control — Agentes & CI/CD

Documentación de referencia para agentes de IA y colaboradores sobre la arquitectura de CI/CD, estrategia de branches y convenciones del proyecto.

---

## Estrategia de Branches

```
main
 └── develop
      ├── feature/<nombre>
      ├── fix/<nombre>
      └── chore/<nombre>
hotfix/<nombre>  →  main (directo, urgente)
```

| Branch       | Propósito                                   | Merge destino |
|--------------|---------------------------------------------|---------------|
| `main`       | Producción. Solo recibe PRs aprobados.      | —             |
| `develop`    | Integración. Base para features/fixes.      | `main`        |
| `feature/**` | Funcionalidad nueva.                        | `develop`     |
| `fix/**`     | Bugfixes.                                   | `develop`     |
| `hotfix/**`  | Fix urgente de producción.                  | `main`        |
| `chore/**`   | Docs, refactors, config sin impacto en CI.  | `develop`     |

### Convención de naming

```
feature/nombre-descriptivo
fix/descripcion-del-bug
hotfix/descripcion-urgente
chore/que-se-actualizo
```

### Protección de ramas recomendada (configurar en GitHub Settings → Branches)

- `main`: Require PR + status check `quality` + no direct push
- `develop`: Require PR + status check `quality`

---

## Workflows de CI/CD

> Arquitectura de 4 workflows separados por responsabilidad para minimizar cómputo innecesario.

### `ci.yml` — Quality Checks

**Runner:** `ubuntu-latest` (1× costo, suficiente para Node puro)

**Cuándo corre:**
- Push a `develop`, `feature/**`, `fix/**`, `hotfix/**`, `chore/**`
- PRs hacia `main` o `develop`
- **Solo si cambiaron** archivos en: `src/`, `src-tauri/`, `package.json`, `pnpm-lock.yaml`, `tailwind.config.js`, `tsconfig*.json`, `.eslintrc*`

**Qué hace:**
1. `pnpm install --frozen-lockfile`
2. `pnpm typecheck` — verificación de tipos TypeScript
3. `pnpm lint` — ESLint con zero warnings

**NO corre si solo cambiaron:** `README.md`, `docs/**`, `.github/**`, `*.sh`, archivos de Homebrew.

---

### `build.yml` — Build en main

**Runner:** `macos-latest` / `macos-13` (requerido por Tauri)

**Cuándo corre:**
- Push a `main` con path filter: `src/**`, `src-tauri/**`, `package.json`, `pnpm-lock.yaml`
- `workflow_dispatch` — trigger manual

**Qué hace:**
1. Build paralelo para `aarch64-apple-darwin` (Apple Silicon) y `x86_64-apple-darwin` (Intel)
2. `cargo test --release` — **solo en aarch64** (unit tests son independientes de arch)
3. `pnpm tauri build` — genera los `.dmg`
4. Upload de artifacts

**No duplica** `typecheck` ni `lint` — esos son responsabilidad del `ci.yml`.

---

### `release.yml` — Build & Release en tags

**Runner:** `macos-latest` / `macos-13` + `ubuntu-latest` (release job)

**Cuándo corre:**
- Tags `v*` — **siempre, sin path filter** (separado de `build.yml` para evitar que el path filter bloquee releases)
- `cancel-in-progress: false` — un release nunca se cancela a mitad

**Qué hace:**
1. Build paralelo para ambas arches
2. `cargo test --release` en aarch64
3. `pnpm tauri build` — genera los `.dmg`
4. Crea GitHub Release con changelog auto-generado

---

### `update-tap.yml` — Homebrew Tap

**Runner:** `ubuntu-latest` (1× costo, solo hace git/curl/sed)

**Cuándo corre:** Solo cuando se publica un release (`release: published`).

**Qué hace:**
1. Descarga los DMG del release (`curl --fail` — falla si la URL no existe)
2. Valida que los SHA256 no estén vacíos antes de escribir el cask
3. Actualiza `Casks/lumus-control.rb` en el repo `dotfn/homebrew-lumus`
4. Commit y push automático

**Secrets requeridos:** `TAP_PAT` — Personal Access Token con permisos de escritura en el tap repo.

---

## Flujo de Trabajo Recomendado

### Feature nueva

```bash
git checkout develop
git pull origin develop
git checkout -b feature/mi-feature
# ... trabajo ...
git push origin feature/mi-feature
# Abrir PR hacia develop en GitHub
```

### Release

```bash
# Desde develop, una vez aprobadas todas las features del sprint
git checkout main
git merge develop
git tag v1.2.0
git push origin main --tags
# El workflow build.yml + update-tap.yml se disparan automáticamente
```

### Hotfix urgente

```bash
git checkout main
git checkout -b hotfix/fix-critico
# ... fix ...
git push origin hotfix/fix-critico
# PR directo a main, luego cherry-pick o merge a develop
```

---

## Comandos Útiles

```bash
# Desarrollo local
pnpm dev:frontend      # Solo frontend (Vite)
pnpm dev               # App Tauri completa

# Verificación (igual que CI)
pnpm typecheck
pnpm lint

# Build
pnpm tauri build --target aarch64-apple-darwin
pnpm tauri build --target x86_64-apple-darwin
```

---

## Estructura del Proyecto

```
lumus-control/
├── .agents/
│   ├── skills/          # Skills de agentes IA (accesibilidad, deploy, etc.)
│   └── agents.md        # Este archivo
├── .github/
│   └── workflows/
│       ├── ci.yml          # Quality checks (typecheck + lint) — ubuntu-latest
│       ├── build.yml       # Build en main con path filters — macos runners
│       ├── release.yml     # Build + Release en tags v* — sin path filter
│       └── update-tap.yml  # Homebrew tap auto-update — ubuntu-latest
├── src/                 # Frontend React/TypeScript
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── stores/          # Zustand stores
│   └── index.css        # Sistema de design tokens (CSS custom properties)
├── src-tauri/           # Backend Rust (Tauri v2)
├── tailwind.config.js   # Configuración Tailwind + tema personalizado
└── vercel.json          # Config deploy landing en Vercel
```

---

## Sistema de Colores y Theming

El proyecto usa **CSS custom properties** como fuente de verdad para el sistema de colores. Tailwind consume estas variables a través de `tailwind.config.js`.

### Principios
- Las variables CSS se definen en `src/index.css` bajo `:root` (light) y `.dark` (dark mode)
- El dark mode se activa via clase `.dark` en el elemento `<html>` (estrategia `class` de Tailwind)
- Los componentes usan clases semánticas como `bg-theme-bg`, `text-theme-primary`, `border-theme-border`
- **No usar** `!important` ni overrides de variables internas de Tailwind para resolver problemas de theming

### Archivos críticos del tema
- `src/index.css` — variables CSS, tokens de diseño, componentes base
- `tailwind.config.js` — mapeo de tokens a utilidades Tailwind
- `src/stores/themeStore.ts` — estado del tema (light/dark) con persistencia

---

## Notas para Agentes IA

- **Antes de modificar `tailwind.config.js` o `index.css`**, verificar el historial de commits reciente para no introducir regresiones visuales
- **No agregar overrides** sobre variables internas de Tailwind (`--tw-bg-opacity`, etc.) para resolver problemas de theming
- **Los componentes no deben compensar** defectos del sistema de temas — si un componente necesita workarounds, es señal de que el problema está en el sistema
- **Branch de trabajo**: crear siempre desde `develop`, nunca desde `main`
- **Commits**: seguir Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `style:`, `perf:`, `ci:`)
