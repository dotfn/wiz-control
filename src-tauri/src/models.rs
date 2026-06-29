use std::collections::HashMap;

#[derive(serde::Serialize, serde::Deserialize, Default, Clone)]
pub struct AppConfig {
    pub device_names: HashMap<String, String>,
    pub last_mac: Option<String>,
    pub theme: Option<String>,
}

#[derive(serde::Serialize, Clone)]
pub struct DeviceStatePayload {
    pub ip: String,
    pub mac: String,
    pub online: bool,
    pub state: Option<serde_json::Value>,
}

#[derive(serde::Serialize, serde::Deserialize, Default, Clone)]
pub struct MigratedConfig {
    pub device_names: HashMap<String, String>,
    pub last_ip: Option<String>,
    pub last_mac: Option<String>,
    pub theme: Option<String>,
}

impl MigratedConfig {
    pub fn into_app_config(self) -> AppConfig {
        AppConfig {
            device_names: self.device_names,
            last_mac: self.last_mac.or(self.last_ip),
            theme: self.theme,
        }
    }
}
