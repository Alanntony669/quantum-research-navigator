import threading
from PyQt6.QtCore import QObject, pyqtSignal
from pynput import keyboard

class HotkeyManager(QObject):
    """
    Manages global background hotkeys using pynput.
    Emits a Qt signal on the main GUI thread when the hotkey is triggered.
    """
    hotkey_triggered = pyqtSignal()

    def __init__(self, hotkey_str: str = "<alt>+c"):
        super().__init__()
        self.hotkey_str = hotkey_str
        self._listener = None
        self._thread = None

    def start(self):
        self.stop()
        try:
            mapping = {self.hotkey_str: self._on_hotkey}
            self._listener = keyboard.GlobalHotKeys(mapping)
            self._listener.daemon = True
            self._listener.start()
            print(f"[HotkeyManager] Registered global hotkey: {self.hotkey_str}")
        except Exception as e:
            print(f"[HotkeyManager] Failed to register hotkey {self.hotkey_str}: {e}")

    def update_hotkey(self, new_hotkey_str: str):
        self.hotkey_str = new_hotkey_str
        self.start()

    def _on_hotkey(self):
        # Safely emit signal across threads
        self.hotkey_triggered.emit()

    def stop(self):
        if self._listener:
            try:
                self._listener.stop()
            except Exception:
                pass
            self._listener = None
