use crate::models::AppConfig;
use std::sync::atomic::AtomicBool;
use std::sync::Arc;
use std::sync::Mutex;

/// Caché en memoria de la configuración del usuario.
/// Cargada desde disco al iniciar la app y usada por los comandos de lectura
/// sin necesidad de acceder al disco en cada invocación.
pub struct ConfigState(pub Mutex<AppConfig>);

/// IP del dispositivo actualmente seleccionado y monitoreado.
/// Usada por el hilo de monitoreo para saber a qué dispositivo hacer polling.
pub struct ActiveDeviceState(pub Mutex<Option<String>>);

/// Señal de apagado para coordinar el cierre limpio del hilo de monitoreo.
/// Cuando se establece en `true`, el hilo sale de su bucle en la próxima iteración.
pub struct ShutdownSignal(pub Arc<AtomicBool>);
