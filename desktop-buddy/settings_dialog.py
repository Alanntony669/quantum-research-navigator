from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit,
    QPushButton, QComboBox, QMessageBox, QWidget
)
from config import load_config, save_config

class SettingsDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("⚙️ Clicky Settings")
        self.setFixedSize(480, 440)
        self.config = load_config()
        self.setStyleSheet("""
            QDialog {
                background-color: #0b0f19;
                color: #f8fafc;
                font-family: 'Segoe UI', sans-serif;
            }
            QLabel {
                color: #94a3b8;
                font-size: 12px;
                font-weight: 500;
            }
            QLineEdit, QComboBox {
                background-color: #111827;
                color: #f8fafc;
                border: 1px solid #1f2937;
                border-radius: 7px;
                padding: 7px 10px;
                font-size: 12px;
            }
            QLineEdit:focus, QComboBox:focus {
                border-color: #00f0ff;
                background-color: #0f172a;
            }
            QPushButton {
                background-color: #0284c7;
                color: white;
                border-radius: 7px;
                padding: 8px 18px;
                font-weight: 600;
                font-size: 12px;
                border: none;
            }
            QPushButton:hover {
                background-color: #0ea5e9;
            }
            QPushButton#cancelBtn {
                background-color: #1f2937;
                color: #94a3b8;
            }
            QPushButton#cancelBtn:hover {
                background-color: #374151;
                color: #f1f5f9;
            }
        """)

        layout = QVBoxLayout(self)
        layout.setSpacing(12)
        layout.setContentsMargins(24, 20, 24, 20)

        title = QLabel("🤖 Desktop AI Buddy Settings")
        title.setStyleSheet("font-size: 16px; font-weight: bold; color: #00f0ff; margin-bottom: 2px;")
        layout.addWidget(title)

        # Provider Selection
        layout.addWidget(QLabel("Primary AI Vision Provider:"))
        self.provider_combo = QComboBox()
        self.provider_combo.addItems(["Gemini (Recommended - Ultra Fast)", "OpenAI (GPT-4o)", "Demo / Offline Mode"])
        
        current_provider = self.config.get("api_provider", "gemini")
        if current_provider == "gemini":
            self.provider_combo.setCurrentIndex(0)
        elif current_provider == "openai":
            self.provider_combo.setCurrentIndex(1)
        else:
            self.provider_combo.setCurrentIndex(2)
        layout.addWidget(self.provider_combo)

        # Gemini Key
        layout.addWidget(QLabel("Google Gemini API Key:"))
        self.gemini_key_input = QLineEdit()
        self.gemini_key_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.gemini_key_input.setPlaceholderText("Paste Gemini Key (AIzaSy...)")
        self.gemini_key_input.setText(self.config.get("gemini_api_key", ""))
        layout.addWidget(self.gemini_key_input)

        # OpenAI Key
        layout.addWidget(QLabel("OpenAI API Key (Optional):"))
        self.openai_key_input = QLineEdit()
        self.openai_key_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.openai_key_input.setPlaceholderText("Paste OpenAI Key (sk-...)")
        self.openai_key_input.setText(self.config.get("openai_api_key", ""))
        layout.addWidget(self.openai_key_input)

        # Sarvam AI Voice Key (Cervom)
        layout.addWidget(QLabel("Sarvam AI (Cervom) Voice API Key:"))
        self.sarvam_key_input = QLineEdit()
        self.sarvam_key_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.sarvam_key_input.setPlaceholderText("Paste Sarvam API Subscription Key for Voice STT")
        self.sarvam_key_input.setText(self.config.get("sarvam_api_key", ""))
        layout.addWidget(self.sarvam_key_input)

        # Global Hotkey info
        layout.addWidget(QLabel("Circle Screen Shortcut:"))
        self.hotkey_input = QLineEdit()
        self.hotkey_input.setText(self.config.get("hotkey", "<alt>+c"))
        self.hotkey_input.setPlaceholderText("e.g. <alt>+c or <ctrl>+<shift>+s")
        layout.addWidget(self.hotkey_input)

        layout.addSpacing(6)

        # Bottom Buttons
        btn_layout = QHBoxLayout()
        btn_layout.addStretch()

        cancel_btn = QPushButton("Cancel")
        cancel_btn.setObjectName("cancelBtn")
        cancel_btn.clicked.connect(self.reject)
        btn_layout.addWidget(cancel_btn)

        save_btn = QPushButton("Save & Apply")
        save_btn.clicked.connect(self._save_settings)
        btn_layout.addWidget(save_btn)

        layout.addLayout(btn_layout)

    def _save_settings(self):
        idx = self.provider_combo.currentIndex()
        if idx == 0:
            self.config["api_provider"] = "gemini"
        elif idx == 1:
            self.config["api_provider"] = "openai"
        else:
            self.config["api_provider"] = "demo"

        self.config["gemini_api_key"] = self.gemini_key_input.text().strip()
        self.config["openai_api_key"] = self.openai_key_input.text().strip()
        self.config["sarvam_api_key"] = self.sarvam_key_input.text().strip()
        self.config["hotkey"] = self.hotkey_input.text().strip() or "<alt>+c"

        save_config(self.config)
        self.accept()
