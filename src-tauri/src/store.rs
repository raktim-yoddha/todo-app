use std::fs;
use std::path::PathBuf;
use crate::models::OverlayState;

pub fn get_state_file_path() -> PathBuf {
    let base = if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
        PathBuf::from(local_app_data)
    } else if let Ok(home) = std::env::var("USERPROFILE") {
        PathBuf::from(home).join("AppData").join("Local")
    } else {
        std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
    };

    let dir = base.join("todo-overlay-app");
    let _ = fs::create_dir_all(&dir);
    dir.join("state.json")
}

pub fn load_state() -> OverlayState {
    let path = get_state_file_path();
    if path.exists() {
        if let Ok(content) = fs::read_to_string(&path) {
            if let Ok(state) = serde_json::from_str::<OverlayState>(&content) {
                return state;
            }
        }
    }
    OverlayState::default()
}

pub fn save_state(state: &OverlayState) -> Result<(), String> {
    let path = get_state_file_path();
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    let json = serde_json::to_string_pretty(state).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())
}
