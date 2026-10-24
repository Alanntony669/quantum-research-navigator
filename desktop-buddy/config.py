import json
import os
from pathlib import Path

CONFIG_DIR = Path.home() / ".clicky_windows"
CONFIG_FILE = CONFIG_DIR / "config.json"

DEFAULT_CONFIG = {
    "api_provider": "gemini",  # "gemini" or "openai"
    "gemini_api_key": "",
    "gemini_model": "gemini-2.5-flash",
    "openai_api_key": "",
    "openai_model": "gpt-4o-mini",
    "sarvam_api_key": "",      # Sarvam AI (Cervom) Speech-to-Text key
    "sarvam_model": "saaras:v4",
    "hotkey": "<alt>+c",
    "theme": "obsidian_cyan",
    "sound_effects": True,
    "math_font_size": 15,
    "auto_copy_answer": False
}

def load_config() -> dict:
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    if not CONFIG_FILE.exists():
        save_config(DEFAULT_CONFIG)
        return DEFAULT_CONFIG.copy()
    try:
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            merged = DEFAULT_CONFIG.copy()
            merged.update(data)
            if not merged["gemini_api_key"]:
                merged["gemini_api_key"] = os.environ.get("GEMINI_API_KEY", "")
            if not merged["openai_api_key"]:
                merged["openai_api_key"] = os.environ.get("OPENAI_API_KEY", "")
            if not merged["sarvam_api_key"]:
                merged["sarvam_api_key"] = os.environ.get("SARVAM_API_KEY", "")
            return merged
    except Exception:
        return DEFAULT_CONFIG.copy()

def save_config(config: dict):
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=4)
