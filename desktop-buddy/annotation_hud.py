import re
import html
from typing import List, Dict
from PyQt6.QtCore import Qt, QRect, QPoint, pyqtSignal, QTimer
from PyQt6.QtGui import QColor, QFont, QWheelEvent, QTextOption
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QPushButton, QLabel,
    QLineEdit, QTextBrowser, QGraphicsDropShadowEffect, QApplication,
    QSizeGrip
)
from math_formatter import markdown_to_rich_html
from voice_engine import VoiceEngine

class SmoothTextBrowser(QTextBrowser):
    """
    Custom QTextBrowser that handles mouse wheel scrolling reliably
    even when another child widget (like QLineEdit) has focus.
    """
    def wheelEvent(self, event: QWheelEvent):
        delta = event.angleDelta().y()
        vbar = self.verticalScrollBar()
        # Responsive, smooth scroll step
        vbar.setValue(vbar.value() - int(delta * 0.9))
        event.accept()

class DraggableHeaderBar(QWidget):
    """
    Draggable top header bar that allows moving the floating HUD anywhere.
    """
    def __init__(self, parent_hud):
        super().__init__()
        self.hud = parent_hud
        self.drag_start_pos = None
        self.setCursor(Qt.CursorShape.SizeAllCursor)

    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self.drag_start_pos = event.globalPosition().toPoint() - self.hud.pos()
            event.accept()
        else:
            super().mousePressEvent(event)

    def mouseMoveEvent(self, event):
        if self.drag_start_pos and (event.buttons() & Qt.MouseButton.LeftButton):
            self.hud.move(event.globalPosition().toPoint() - self.drag_start_pos)
            event.accept()
        else:
            super().mouseMoveEvent(event)

    def mouseReleaseEvent(self, event):
        self.drag_start_pos = None
        super().mouseReleaseEvent(event)

class AnnotationHUD(QWidget):
    """
    Floating in-place Annotation Card docked next to the captured equation.
    - Fully draggable anywhere across the screen.
    - Freely resizable using the bottom-right size grip.
    - Expand/Restore toggle button for large chat view.
    - Full chat history with smooth scrolling and zero clipping.
    - Pure Matte Obsidian & Ice Cyan styling (NO PURPLE GRADIENTS).
    - Sarvam AI (Cervom) Voice input support.
    """
    follow_up_requested = pyqtSignal(str)
    closed = pyqtSignal()

    CSS_STYLES = """
    <style>
        body {
            background-color: #0b0f19;
            color: #f1f5f9;
            font-family: 'Segoe UI', -apple-system, sans-serif;
            font-size: 13.5px;
            line-height: 1.6;
            margin: 0;
            padding: 8px 12px 20px 8px;
            word-wrap: break-word;
        }
        .ai-bubble {
            background-color: #111827;
            border: 1px solid rgba(0, 240, 255, 0.35);
            border-radius: 10px;
            padding: 12px 14px;
            margin-bottom: 14px;
            word-break: break-word;
        }
        .user-bubble {
            background-color: #0284c7;
            border: 1px solid #38bdf8;
            border-radius: 10px;
            padding: 10px 14px;
            margin-bottom: 14px;
            margin-left: 32px;
            color: #ffffff;
            word-break: break-word;
        }
        .thinking-bubble {
            background-color: #111827;
            border: 1px dashed #00f0ff;
            border-radius: 10px;
            padding: 10px 14px;
            margin-bottom: 14px;
            color: #94a3b8;
            font-style: italic;
        }
        .author-tag {
            font-size: 11px;
            font-weight: bold;
            color: #00f0ff;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .user-bubble .author-tag {
            color: #e0f2fe;
        }
        .section-title {
            color: #00f0ff;
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0 4px 0;
            border-bottom: 1px solid rgba(0, 240, 255, 0.25);
            padding-bottom: 3px;
        }
        .math-card {
            background-color: #030712;
            border: 1.5px solid #00f0ff;
            border-radius: 7px;
            padding: 9px 12px;
            margin: 8px 0;
            font-size: 15px;
            font-weight: bold;
            color: #00f0ff;
            text-align: center;
        }
        .math-inline {
            background-color: #030712;
            padding: 1px 5px;
            border-radius: 4px;
            font-size: 13.5px;
            color: #38bdf8;
            font-weight: 600;
        }
        .callout {
            background-color: #111827;
            border-left: 3px solid #00f0ff;
            padding: 6px 10px;
            margin: 6px 0;
            color: #94a3b8;
        }
        ol, ul {
            margin: 4px 0 8px 0;
            padding-left: 20px;
        }
        li {
            margin-bottom: 5px;
        }
        p {
            margin: 4px 0 6px 0;
        }
        code {
            background: #030712;
            padding: 2px 4px;
            border-radius: 3px;
            color: #00f0ff;
        }
    </style>
    """

    def __init__(self, voice_engine: VoiceEngine = None):
        super().__init__()
        self.target_rect = QRect()
        self.conversation: List[Dict[str, str]] = []
        self.is_waiting = False
        self.is_expanded = False
        self.voice_engine = voice_engine

        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint |
            Qt.WindowType.WindowStaysOnTopHint |
            Qt.WindowType.Tool
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        
        # Responsive sizing
        self.setMinimumSize(460, 480)
        self.resize(560, 680)

        self._init_ui()
        self._init_voice()

    def _init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(10, 10, 10, 10)

        # Matte Obsidian & Ice Cyan Card
        self.card = QWidget(self)
        self.card.setObjectName("card")
        self.card.setStyleSheet("""
            QWidget#card {
                background-color: #0b0f19;
                border: 2px solid #00f0ff;
                border-radius: 14px;
            }
        """)

        shadow = QGraphicsDropShadowEffect(self)
        shadow.setBlurRadius(24)
        shadow.setColor(QColor(0, 0, 0, 190))
        shadow.setOffset(0, 6)
        self.card.setGraphicsEffect(shadow)

        card_layout = QVBoxLayout(self.card)
        card_layout.setContentsMargins(14, 12, 14, 12)
        card_layout.setSpacing(10)

        # Draggable Header Bar
        self.header_bar = DraggableHeaderBar(self)
        header_layout = QHBoxLayout(self.header_bar)
        header_layout.setContentsMargins(4, 2, 4, 4)
        header_layout.setSpacing(8)

        self.title_icon = QLabel("📐")
        self.title_icon.setStyleSheet("font-size: 17px;")
        header_layout.addWidget(self.title_icon)

        self.title_label = QLabel("Clicky AI")
        self.title_label.setStyleSheet("""
            color: #00f0ff;
            font-size: 14px;
            font-weight: 700;
            font-family: 'Segoe UI', sans-serif;
            letter-spacing: 0.5px;
        """)
        header_layout.addWidget(self.title_label, stretch=1)

        # Copy button
        self.copy_btn = QPushButton("📋 Copy")
        self.copy_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.copy_btn.setStyleSheet("""
            QPushButton {
                background: #111827;
                color: #cbd5e1;
                border: 1px solid #1f2937;
                border-radius: 6px;
                padding: 4px 10px;
                font-size: 11px;
                font-weight: 600;
            }
            QPushButton:hover {
                background: #1f2937;
                color: #f8fafc;
                border-color: #00f0ff;
            }
        """)
        self.copy_btn.clicked.connect(self._copy_all_content)
        header_layout.addWidget(self.copy_btn)

        # Expand / Resize Toggle Button
        self.expand_btn = QPushButton("⛶")
        self.expand_btn.setToolTip("Toggle Large / Normal View")
        self.expand_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.expand_btn.setStyleSheet("""
            QPushButton {
                background: #111827;
                color: #94a3b8;
                border: 1px solid #1f2937;
                border-radius: 6px;
                font-size: 14px;
                padding: 3px 8px;
            }
            QPushButton:hover {
                color: #00f0ff;
                border-color: #00f0ff;
            }
        """)
        self.expand_btn.clicked.connect(self._toggle_expand)
        header_layout.addWidget(self.expand_btn)

        # Close button
        self.close_btn = QPushButton("✕")
        self.close_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.close_btn.setStyleSheet("""
            QPushButton {
                background: transparent;
                color: #94a3b8;
                border: none;
                font-size: 16px;
                font-weight: 700;
                padding: 2px 6px;
            }
            QPushButton:hover {
                color: #ef4444;
            }
        """)
        self.close_btn.clicked.connect(self.hide_hud)
        header_layout.addWidget(self.close_btn)

        card_layout.addWidget(self.header_bar)

        # SmoothTextBrowser with line wrapping and full chat visibility
        self.chat_display = SmoothTextBrowser()
        self.chat_display.setOpenExternalLinks(True)
        self.chat_display.setLineWrapMode(QTextBrowser.LineWrapMode.WidgetWidth)
        self.chat_display.setStyleSheet("""
            QTextBrowser {
                background-color: #0b0f19;
                border: none;
                color: #f1f5f9;
            }
            QScrollBar:vertical {
                background: #0b0f19;
                width: 9px;
                margin: 0px;
                border-radius: 4px;
            }
            QScrollBar::handle:vertical {
                background: #1f2937;
                min-height: 25px;
                border-radius: 4px;
            }
            QScrollBar::handle:vertical:hover {
                background: #00f0ff;
            }
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
                height: 0px;
            }
        """)
        card_layout.addWidget(self.chat_display, stretch=1)

        # Bottom Bar: Input field + Voice Mic + SizeGrip
        bottom_layout = QHBoxLayout()
        bottom_layout.setSpacing(8)

        # Sarvam AI Voice Mic
        self.mic_btn = QPushButton("🎙️")
        self.mic_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.mic_btn.setToolTip("Speak Question (Sarvam AI Voice)")
        self.mic_btn.setFixedSize(38, 36)
        self.mic_btn.setStyleSheet("""
            QPushButton {
                background-color: #111827;
                color: #00f0ff;
                border: 1px solid #1f2937;
                border-radius: 8px;
                font-size: 16px;
            }
            QPushButton:hover {
                background-color: #1f2937;
                border-color: #00f0ff;
            }
        """)
        self.mic_btn.clicked.connect(self._toggle_voice_recording)
        bottom_layout.addWidget(self.mic_btn)

        self.input_field = QLineEdit()
        self.input_field.setPlaceholderText("Type or click 🎙️ to ask a question...")
        self.input_field.setStyleSheet("""
            QLineEdit {
                background-color: #111827;
                color: #f1f5f9;
                border: 1px solid #1f2937;
                border-radius: 8px;
                padding: 8px 12px;
                font-size: 12.5px;
                font-family: 'Segoe UI', sans-serif;
            }
            QLineEdit:focus {
                border: 1.5px solid #00f0ff;
                background-color: #0f172a;
            }
        """)
        self.input_field.returnPressed.connect(self._submit_follow_up)
        bottom_layout.addWidget(self.input_field, stretch=1)

        self.send_btn = QPushButton("Ask")
        self.send_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.send_btn.setStyleSheet("""
            QPushButton {
                background-color: #0284c7;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 8px 18px;
                font-size: 12.5px;
                font-weight: 700;
            }
            QPushButton:hover {
                background-color: #0ea5e9;
            }
            QPushButton:disabled {
                background-color: #1f2937;
                color: #64748b;
            }
        """)
        self.send_btn.clicked.connect(self._submit_follow_up)
        bottom_layout.addWidget(self.send_btn)

        # Size grip to freely resize window by dragging the corner
        self.size_grip = QSizeGrip(self)
        self.size_grip.setFixedSize(16, 16)
        self.size_grip.setStyleSheet("background: transparent; color: #00f0ff;")
        bottom_layout.addWidget(self.size_grip, alignment=Qt.AlignmentFlag.AlignBottom | Qt.AlignmentFlag.AlignRight)

        card_layout.addLayout(bottom_layout)
        main_layout.addWidget(self.card)

    def _init_voice(self):
        if self.voice_engine:
            self.voice_engine.recording_started.connect(self._on_voice_started)
            self.voice_engine.recording_stopped.connect(self._on_voice_stopped)
            self.voice_engine.transcription_ready.connect(self._on_voice_transcribed)
            self.voice_engine.voice_error.connect(self._on_voice_error)

    def _toggle_expand(self):
        screen_geo = QApplication.primaryScreen().geometry()
        if not self.is_expanded:
            self.is_expanded = True
            # Expand to larger view
            new_w = min(740, screen_geo.width() - 80)
            new_h = min(840, screen_geo.height() - 100)
            self.resize(new_w, new_h)
            self.expand_btn.setText("❐")
        else:
            self.is_expanded = False
            self.resize(560, 680)
            self.expand_btn.setText("⛶")
        self._scroll_to_bottom()

    def _toggle_voice_recording(self):
        if not self.voice_engine:
            return
        if not self.voice_engine.is_recording:
            self.voice_engine.start_recording()
        else:
            self.voice_engine.stop_recording_and_transcribe()

    def _on_voice_started(self):
        self.mic_btn.setText("🔴")
        self.mic_btn.setStyleSheet("""
            QPushButton {
                background-color: #7f1d1d;
                color: #ffffff;
                border: 1.5px solid #ef4444;
                border-radius: 8px;
                font-size: 15px;
            }
        """)
        self.input_field.setPlaceholderText("🎙️ Listening... Speak into your mic! Click 🔴 when done.")

    def _on_voice_stopped(self):
        self.mic_btn.setText("🎙️")
        self.mic_btn.setStyleSheet("""
            QPushButton {
                background-color: #111827;
                color: #00f0ff;
                border: 1px solid #1f2937;
                border-radius: 8px;
                font-size: 16px;
            }
        """)
        self.input_field.setPlaceholderText("⚡ Sarvam AI is transcribing your question...")

    def _on_voice_transcribed(self, text: str):
        self.input_field.setText(text)
        self.input_field.setPlaceholderText("Type or click 🎙️ to ask a question...")
        self._submit_follow_up()

    def _on_voice_error(self, err_msg: str):
        self.mic_btn.setText("🎙️")
        self.input_field.setPlaceholderText("Type or click 🎙️ to ask a question...")
        self.append_ai_reply(f"⚠️ **Voice Error:** {err_msg}")

    def display_solution(self, initial_markdown: str, target_rect: QRect):
        self.target_rect = target_rect
        self.conversation = [{"role": "assistant", "content": initial_markdown}]
        self.is_waiting = False
        self._update_input_state(True)

        screen_geo = QApplication.primaryScreen().geometry()
        card_w, card_h = self.width(), self.height()

        dock_x = target_rect.right() + 20
        dock_y = max(20, target_rect.top() - 20)

        if dock_x + card_w > screen_geo.right() - 20:
            dock_x = max(20, target_rect.left() - card_w - 20)

        if dock_y + card_h > screen_geo.bottom() - 20:
            dock_y = max(20, screen_geo.bottom() - card_h - 20)

        self.move(dock_x, dock_y)
        self._render_conversation()

        self.show()
        self.raise_()
        self.activateWindow()
        self.input_field.setFocus()

    def set_loading(self, target_rect: QRect):
        self.target_rect = target_rect
        self.conversation = []
        screen_geo = QApplication.primaryScreen().geometry()
        dock_x = min(target_rect.right() + 20, screen_geo.right() - self.width() - 20)
        dock_y = max(20, target_rect.top())
        self.move(dock_x, dock_y)

        loading_html = (
            self.CSS_STYLES +
            '<body><div class="thinking-bubble">'
            '<div class="author-tag">🤖 Clicky</div>'
            '⚡ Inspecting circled region and deriving step-by-step solution...'
            '</div></body>'
        )
        self.chat_display.setHtml(loading_html)
        self.show()
        self.raise_()

    def append_ai_reply(self, reply_markdown: str):
        self.conversation.append({"role": "assistant", "content": reply_markdown})
        self.is_waiting = False
        self._update_input_state(True)
        self._render_conversation()

    def _submit_follow_up(self):
        text = self.input_field.text().strip()
        if text and not self.is_waiting:
            self.input_field.clear()
            self.conversation.append({"role": "user", "content": text})
            self.is_waiting = True
            self._update_input_state(False)
            self._render_conversation()
            self.follow_up_requested.emit(text)

    def _update_input_state(self, enabled: bool):
        self.input_field.setEnabled(enabled)
        self.send_btn.setEnabled(enabled)
        self.mic_btn.setEnabled(enabled)
        if enabled:
            self.send_btn.setText("Ask")
            self.input_field.setFocus()
        else:
            self.send_btn.setText("Thinking...")

    def _render_conversation(self):
        body_parts = []
        for msg in self.conversation:
            if msg["role"] == "user":
                safe_user_text = html.escape(msg["content"])
                body_parts.append(f"""
                <div class="user-bubble">
                    <div class="author-tag">🧑 You</div>
                    <div>{safe_user_text}</div>
                </div>
                """)
            else:
                formatted_ai = markdown_to_rich_html(msg["content"])
                body_parts.append(f"""
                <div class="ai-bubble">
                    <div class="author-tag">🤖 Clicky</div>
                    <div>{formatted_ai}</div>
                </div>
                """)

        if self.is_waiting:
            body_parts.append("""
            <div class="thinking-bubble">
                <div class="author-tag">🤖 Clicky</div>
                ⚡ Thinking and solving your question...
            </div>
            """)

        full_html = f"{self.CSS_STYLES}<body>{''.join(body_parts)}</body>"
        self.chat_display.setHtml(full_html)
        QTimer.singleShot(50, self._scroll_to_bottom)

    def _scroll_to_bottom(self):
        vbar = self.chat_display.verticalScrollBar()
        vbar.setValue(vbar.maximum())

    def _copy_all_content(self):
        full_text = []
        for msg in self.conversation:
            author = "You" if msg["role"] == "user" else "Clicky"
            full_text.append(f"### {author}:\n{msg['content']}\n")
        if full_text:
            QApplication.clipboard().setText("\n".join(full_text))
            self.copy_btn.setText("✓ Copied!")
            QTimer.singleShot(1800, lambda: self.copy_btn.setText("📋 Copy"))

    def hide_hud(self):
        self.hide()
        self.closed.emit()
