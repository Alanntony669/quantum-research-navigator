import sys
import os
import threading
from concurrent.futures import ThreadPoolExecutor

from PyQt6.QtCore import Qt, QRect, QObject, pyqtSignal
from PyQt6.QtGui import QIcon, QPixmap, QPainter, QColor, QFont
from PyQt6.QtWidgets import QApplication, QSystemTrayIcon, QMenu

from config import load_config, save_config
from ai_engine import AIEngine
from buddy_widget import BuddyWidget
from snipping_overlay import SnippingOverlay
from annotation_hud import AnnotationHUD
from settings_dialog import SettingsDialog
from hotkey_manager import HotkeyManager
from voice_engine import VoiceEngine

# Configure Chromium to eliminate scroll flickering on Windows
import os
os.environ["QTWEBENGINE_CHROMIUM_FLAGS"] = "--disable-gpu-compositing --enable-smooth-scrolling"

# Set Windows Per-Monitor DPI Awareness
try:
    import ctypes
    ctypes.windll.shcore.SetProcessDpiAwareness(2)
except Exception:
    pass

class AIWorker(QObject):
    """Background worker to query AI model without blocking UI."""
    initial_finished = pyqtSignal(str, QRect)
    follow_up_finished = pyqtSignal(str)
    error = pyqtSignal(str)

    def __init__(self, ai_engine: AIEngine):
        super().__init__()
        self.ai_engine = ai_engine
        self.executor = ThreadPoolExecutor(max_workers=2)

    def analyze_async(self, image_bytes: bytes, rect: QRect, custom_question: str = None):
        def task():
            try:
                result = self.ai_engine.analyze_image(image_bytes, custom_question)
                self.initial_finished.emit(result, rect)
            except Exception as e:
                self.error.emit(str(e))

        self.executor.submit(task)

    def follow_up_async(self, user_question: str):
        def task():
            try:
                reply = self.ai_engine.answer_follow_up(user_question)
                self.follow_up_finished.emit(reply)
            except Exception as e:
                self.error.emit(str(e))

        self.executor.submit(task)

class ClickyApp(QObject):
    def __init__(self):
        super().__init__()
        self.config = load_config()
        self.ai_engine = AIEngine(self.config)
        self.voice_engine = VoiceEngine(self.config)

        # Current session memory
        self.current_image_bytes = None
        self.current_rect = None

        # Core Components
        self.buddy = BuddyWidget()
        self.snipper = SnippingOverlay()
        self.hud = AnnotationHUD(self.voice_engine)
        self.worker = AIWorker(self.ai_engine)

        # Hotkey Manager
        self.hotkey_mgr = HotkeyManager(self.config.get("hotkey", "<alt>+c"))

        # Setup System Tray
        self._init_tray()

        # Connect Events
        self._connect_signals()

        # Start Services
        self.hotkey_mgr.start()
        self.buddy.show()

    def _init_tray(self):
        self.tray = QSystemTrayIcon()
        pix = QPixmap(32, 32)
        pix.fill(Qt.GlobalColor.transparent)
        painter = QPainter(pix)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        painter.setBrush(QColor(56, 189, 248))
        painter.setPen(Qt.PenStyle.NoPen)
        painter.drawEllipse(2, 2, 28, 28)
        painter.setPen(Qt.GlobalColor.white)
        painter.setFont(QFont("Segoe UI", 14, QFont.Weight.Bold))
        painter.drawText(pix.rect(), Qt.AlignmentFlag.AlignCenter, "C")
        painter.end()

        self.tray.setIcon(QIcon(pix))
        self.tray.setToolTip("Clicky Desktop AI Buddy (Alt+C to Snip)")

        menu = QMenu()
        snip_action = menu.addAction("✂ Snip Equation (Alt+C)")
        snip_action.triggered.connect(self.start_snip_flow)

        toggle_buddy = menu.addAction("🤖 Toggle Buddy")
        toggle_buddy.triggered.connect(self._toggle_buddy)

        settings_action = menu.addAction("⚙️ Settings")
        settings_action.triggered.connect(self.open_settings)

        menu.addSeparator()
        exit_action = menu.addAction("❌ Exit")
        exit_action.triggered.connect(QApplication.instance().quit)

        self.tray.setContextMenu(menu)
        self.tray.show()

    def _connect_signals(self):
        # Trigger snip via buddy or hotkey
        self.buddy.trigger_snip.connect(self.start_snip_flow)
        self.buddy.open_settings.connect(self.open_settings)
        self.hotkey_mgr.hotkey_triggered.connect(self.start_snip_flow)

        # Snipper responses
        self.snipper.region_selected.connect(self._on_region_selected)
        self.snipper.canceled.connect(self._on_snip_canceled)

        # Worker signals
        self.worker.initial_finished.connect(self._on_initial_ai_finished)
        self.worker.follow_up_finished.connect(self._on_follow_up_finished)
        self.worker.error.connect(self._on_ai_error)

        # HUD Follow-ups
        self.hud.follow_up_requested.connect(self._on_follow_up)
        self.hud.closed.connect(lambda: self.buddy.set_status(BuddyWidget.STATUS_IDLE))

    def start_snip_flow(self):
        self.buddy.set_status(BuddyWidget.STATUS_SNIPPING)
        self.hud.hide()
        self.snipper.start_selection()

    def _on_snip_canceled(self):
        self.buddy.set_status(BuddyWidget.STATUS_IDLE)

    def _on_region_selected(self, image_bytes: bytes, rect: QRect):
        self.current_image_bytes = image_bytes
        self.current_rect = rect

        self.buddy.set_status(BuddyWidget.STATUS_THINKING)
        self.hud.set_loading(rect)

        # Reset engine's chat history for new problem
        self.ai_engine.reset_chat()

        # Dispatch async to AI
        self.worker.analyze_async(image_bytes, rect)

    def _on_initial_ai_finished(self, markdown_text: str, rect: QRect):
        self.buddy.set_status(BuddyWidget.STATUS_IDLE)
        self.hud.display_solution(markdown_text, rect)

    def _on_follow_up(self, user_question: str):
        self.buddy.set_status(BuddyWidget.STATUS_THINKING)
        self.worker.follow_up_async(user_question)

    def _on_follow_up_finished(self, reply_markdown: str):
        self.buddy.set_status(BuddyWidget.STATUS_IDLE)
        self.hud.append_ai_reply(reply_markdown)

    def _on_ai_error(self, err_msg: str):
        self.buddy.set_status(BuddyWidget.STATUS_IDLE)
        err_markdown = f"### ⚠️ Could Not Process\n\nError: `{err_msg}`\n\nPlease check your network or API Key in Settings."
        if self.hud.isVisible():
            self.hud.append_ai_reply(err_markdown)
        elif self.current_rect:
            self.hud.display_solution(err_markdown, self.current_rect)

    def _toggle_buddy(self):
        if self.buddy.isVisible():
            self.buddy.hide()
        else:
            self.buddy.show()

    def open_settings(self):
        dlg = SettingsDialog()
        if dlg.exec():
            self.config = load_config()
            self.ai_engine.config = self.config
            self.voice_engine.config = self.config
            new_hotkey = self.config.get("hotkey", "<alt>+c")
            self.hotkey_mgr.update_hotkey(new_hotkey)

def main():
    app = QApplication(sys.argv)
    app.setQuitOnLastWindowClosed(False)

    clicky = ClickyApp()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
