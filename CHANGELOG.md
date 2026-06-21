# Changelog

## [0.2.0] — 2026-06-21

### CI/CD
- Workflow reestructurado con 3 jobs: quality → build → release
- Release automático publicado (no draft) al pushear tag v*
- Changelog generado automáticamente desde git log
- Se agrego `cargo test` a la fase de calidad
- Artefacto .dmg subido como build artifact

### Docs
- CHANGELOG.md creado con historial completo
- README actualizado: descarga via Releases, solo macOS

### Chore
- Sincronización de versión entre package.json, tauri.conf.json y Cargo.toml

## [0.1.0] — 2026-06-21

### Features
- Scaffolding Tauri + React + TypeScript
- Backend Rust modular con comandos IPC
- Descubrimiento UDP de dispositivos en red local
- Control completo: encendido/apagado, brillo, temperatura de color y RGB
- Escenas dinámicas con modos del protocolo
- Sleep timer con fade progresivo
- Tema claro/oscuro sincronizado con ventana nativa
- Alias de dispositivos personalizados
- Polling asíncrono de estado cada 5 segundos
- Frontend React con Zustand stores por dominio
- Capa de servicios (`deviceService.ts`) como abstracción IPC
- Actualizaciones optimistas con rollback

### Refactors
- Migración a backend Rust modular con estados granulares
- Vistas separadas: Dashboard, Escenas, Temporizador, Configuración
- Rebranding completo de WiZ a Lumus

### Fixes
- Validación de entradas en frontend y refuerzo de tipos
- Sanitización de errores y protección de archivo de configuración
- Validación de IPs en backend Rust
- Protección CSP y restricción de servidor de desarrollo
- Almacenamiento migrado de localStorage a backend Tauri
- Fuentes Google auto-hosteadas
- Flash blanco eliminado al abrir la app
- Tema aplicado correctamente y sin parpadeos
- Configuración atómica con escritura segura (tmp → sync → rename)

### Tests
- 12 tests unitarios para `config.rs` y `network.rs`:
  - Escritura atómica
  - Lectura con archivo corrupto
  - Roundtrip de configuración
  - Validación de IPs

### CI
- Workflow de GitHub Actions para lint, typecheck y build
- Release automático para macOS (Apple Silicon)
