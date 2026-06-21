# Lumus Control 💡

<p>
  <img src="https://img.shields.io/badge/Tauri-v2.x-0066FF?logo=tauri&logoColor=white">
  <img src="https://img.shields.io/badge/Rust-1.77%2B-black?logo=rust&logoColor=white">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white">
  <img src="https://img.shields.io/badge/Zustand-5.x-black">
  <img src="https://img.shields.io/badge/UDP_Port-38899-0066FF">
  <img src="https://img.shields.io/github/actions/workflow/status/dotfn/lumus-control/build.yml?label=CI&logo=github">
</p>

Aplicación de escritorio nativa para descubrir y controlar bombillas inteligentes en tu red local. Sin nube, sin intermediarios — comunicación directa mediante **UDP** en tiempo real.

Disponible para **macOS** (Apple Silicon).

---

## Funcionalidades

- **Descubrimiento automático** de bombillas en la red local vía broadcast UDP
- **Control completo**: encendido/apagado, brillo, temperatura de color y RGB
- **Escenas dinámicas** — acceso a todos los modos de escena del protocolo
- **Sleep timer** con fade progresivo del brillo hasta apagado
- **Tema claro/oscuro** sincronizado con la ventana nativa
- **Alias de dispositivos** — renombrá cada bombilla con un nombre personalizado
- **Estado en tiempo real** — polling asíncrono cada 5 segundos con indicador online/offline
- **Sin internet requerido** — la app funciona completamente offline

---

## Arquitectura

El proyecto está dividido en dos capas con responsabilidades estrictamente separadas.

```
lumus-control/
├── src/                          # Frontend — React + Zustand
│   ├── features/
│   │   ├── devices/              # Descubrimiento UDP y selección de dispositivo
│   │   ├── lighting/             # Control de luz (brillo, color, escenas)
│   │   ├── settings/             # Tema claro/oscuro
│   │   ├── timer/                # Sleep timer con fade
│   │   └── layout/               # Titlebar nativa (Traffic Lights)
│   ├── services/
│   │   └── deviceService.ts      # Abstracción IPC — única puerta de entrada a Tauri
│   └── types.ts
│
└── src-tauri/src/                # Backend — Rust
    ├── lib.rs                    # Orquestador: estados, on_window_event, handlers
    ├── commands.rs               # IPC handlers (#[tauri::command])
    ├── network.rs                # UDP asíncrono con tokio::net
    ├── config.rs                 # Persistencia con escritura atómica
    ├── state.rs                  # ConfigState, ActiveDeviceState, ShutdownSignal
    ├── monitor.rs                # Polling asíncrono (tokio::spawn)
    ├── models.rs                 # Estructuras de datos compartidas
    └── errors.rs                 # AppError centralizado
```

### Backend Rust

- **UDP asíncrono**: `tokio::net::UdpSocket` con timeouts no bloqueantes — la UI nunca se congela esperando respuestas de red
- **Estado granular en Tauri**: tres estados independientes (`ConfigState`, `ActiveDeviceState`, `ShutdownSignal`) en lugar de un monolito
- **Lecturas desde caché**: `get_preferences` y `get_device_names` leen del `Mutex<AppConfig>` en memoria, sin tocar el disco
- **Escritura atómica**: `config.json` se escribe via `tmp → sync_all() → rename`, garantizando que el archivo nunca quede corrupto por un cierre forzado
- **Monitor asíncrono**: el polling corre como una tarea Tokio (`tokio::spawn`) con `tokio::time::sleep`, sin bloquear ningún hilo del OS
- **Apagado limpio**: `on_window_event(CloseRequested)` activa `ShutdownSignal(AtomicBool)`, el monitor sale en su próxima iteración
- **Validación de origen UDP**: las respuestas de IPs distintas al dispositivo consultado son descartadas para evitar paquetes parásitos en la red local

### Frontend React

- **Stores Zustand** por dominio: `useDeviceStore`, `useLightingStore`, `useTimerStore`, `useSettingsStore`
- **Capa de servicios** (`deviceService.ts`): los stores no conocen Tauri directamente
- **Actualizaciones optimistas con rollback**: la UI responde instantáneamente; si el comando UDP falla, el estado revierte al valor anterior
- **Custom hooks** para efectos de tiempo: `useLightEvents`, `useSleepTimerCountdown`

---

## Protocolo UDP

Las bombillas escuchan en el puerto **38899**. La app implementa el protocolo directamente en Rust:

```json
// Descubrimiento (broadcast a 255.255.255.255:38899)
{"method": "getPilot", "params": {}}

// Control directo (unicast a la IP del dispositivo)
{"method": "setPilot", "params": {"state": true, "dimming": 80, "temp": 3000}}
{"method": "setPilot", "params": {"r": 255, "g": 100, "b": 0}}
{"method": "setPilot", "params": {"sceneId": 14}}
```

---

## Instalación

### One-liner (recomendado)

Copia y pega esto en la Terminal:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/dotfn/lumus-control/main/install.sh)"
```

El script detecta automáticamente tu arquitectura (Apple Silicon / Intel), descarga el DMG correcto desde GitHub, lo instala en `/Applications` y remueve el atributo de cuarentena para evitar el bloqueo de Gatekeeper.

### Homebrew

```bash
brew tap dotfn/lumus
brew install --cask lumus-control
```

### Descarga manual

Descargá el DMG desde la página de [**Releases**](../../releases).

| Plataforma | Archivo |
|---|---|
| macOS (Apple Silicon) | `lumus-control_<version>_aarch64.dmg` |
| macOS (Intel) | `lumus-control_<version>_x86_64.dmg` |

Luego ejecutá en la Terminal:

```bash
bash install.sh
```

### Build local

```bash
pnpm install
pnpm tauri build
bash install.sh
```

---

## Desarrollo local

### Requisitos

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v9+
- [Rust](https://rustup.rs/) 1.77+ (vía `rustup`)
- macOS: Xcode Command Line Tools
- Linux: `libwebkit2gtk-4.1-dev`, `pkg-config`, `libssl-dev`

### Comandos

```bash
# Instalar dependencias
pnpm install

# Modo desarrollo (hot reload)
pnpm run dev

# Verificación de tipos
pnpm run typecheck

# Linter
pnpm run lint

# Compilar para producción
pnpm tauri build
```

Los instaladores generados quedan en `src-tauri/target/release/bundle/`.

### Tests del backend

```bash
cargo test --manifest-path src-tauri/Cargo.toml
```

El backend tiene **12 tests unitarios** en `config.rs` y `network.rs` cubriendo escritura atómica, lectura con archivo corrupto, roundtrip de configuración y validación de IPs.

---

## CI / CD

El repositorio incluye un workflow de GitHub Actions (`.github/workflows/build.yml`) con tres fases:

```
PR a main ──→ quality (typecheck + lint + cargo test)
Push a main ─→ quality → build (macOS .dmg como artifact)
Tag v* ─────→ quality → build → release (GitHub Release público)
```

Cada release publicado en la pestaña [**Releases**](../../releases) incluye el instalador `.dmg` y las notas de cambio generadas automáticamente desde el historial de git.

---

## Licencia

MIT
