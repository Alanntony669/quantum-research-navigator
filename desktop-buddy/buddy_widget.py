import math
from PyQt6.QtCore import Qt, QPoint, QRect, QTimer, pyqtSignal
from PyQt6.QtGui import QPainter, QColor, QPen, QFont, QPainterPath
from PyQt6.QtWidgets import QWidget, QApplication, QToolTip

class BuddyWidget(QWidget):
    """
    Floating animated Desktop AI Buddy.
    Minimal, sleek dark obsidian theme with electric cyan and amber accents.
    NO purple colors anywhere.
    """
    trigger_snip = pyqtSignal()
    open_settings = pyqtSignal()

    STATUS_IDLE = "idle"
    STATUS_SNIPPING = "snipping"
    STATUS_THINKING = "thinking"

    def __init__(self):
        super().__init__()
        self.status = self.STATUS_IDLE
        self.drag_position = QPoint()
        self.is_dragging = False

        # Animation states
        self.blink_state = 0.0
        self.pulse_phase = 0.0
        self.is_hovered = False

        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint |
            Qt.WindowType.WindowStaysOnTopHint |
            Qt.WindowType.SubWindow
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        self.setFixedSize(92, 92)

        # Bottom-right corner placement
        screen = QApplication.primaryScreen().geometry()
        self.move(screen.width() - 130, screen.height() - 170)

        # Animation Timer (25 FPS for smooth, light rendering)
        self.anim_timer = QTimer(self)
        self.anim_timer.timeout.connect(self._update_animation)
        self.anim_timer.start(40)

        # Blinking timer
        self.blink_timer = QTimer(self)
        self.blink_timer.timeout.connect(self._trigger_blink)
        self.blink_timer.start(3800)
        self.is_blinking = False

    def set_status(self, status: str):
        self.status = status
        self.update()

    def _trigger_blink(self):
        self.is_blinking = True

    def _update_animation(self):
        self.pulse_phase = (self.pulse_phase + 0.07) % (2 * math.pi)

        if self.is_blinking:
            self.blink_state += 0.2
            if self.blink_state >= 1.0:
                self.blink_state = 1.0
                self.is_blinking = False
        elif self.blink_state > 0.0:
            self.blink_state = max(0.0, self.blink_state - 0.2)

        self.update()

    def enterEvent(self, event):
        self.is_hovered = True
        QToolTip.showText(
            self.mapToGlobal(QPoint(10, -32)),
            "Click: Circle Any PDF / Screen (Alt+C)\nRight-Click: Settings",
            self
        )
        self.update()

    def leaveEvent(self, event):
        self.is_hovered = False
        self.update()

    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self.drag_position = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
            self.is_dragging = False
        elif event.button() == Qt.MouseButton.RightButton:
            self.open_settings.emit()

    def mouseMoveEvent(self, event):
        if event.buttons() == Qt.MouseButton.LeftButton:
            new_pos = event.globalPosition().toPoint() - self.drag_position
            if (new_pos - self.pos()).manhattanLength() > 4:
                self.is_dragging = True
                self.move(new_pos)

    def mouseReleaseEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            if not self.is_dragging:
                self.trigger_snip.emit()
            self.is_dragging = False

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)

        center_x, center_y = self.width() // 2, self.height() // 2
        radius = 35

        # Pure Obsidian & Cyan theme - NO PURPLE GRADIENTS
        if self.status == self.STATUS_THINKING:
            glow_color = QColor(16, 185, 129)   # Electric Emerald
            bg_color = QColor(6, 24, 18)
        elif self.status == self.STATUS_SNIPPING:
            glow_color = QColor(245, 158, 11)   # Cyber Amber
            bg_color = QColor(26, 18, 7)
        else:
            glow_color = QColor(0, 240, 255)    # Ice Cyan
            bg_color = QColor(11, 15, 25)       # Matte Obsidian

        # 1. Subtle Outer Glow
        pulse_scale = 1.0 + 0.07 * math.sin(self.pulse_phase)
        glow_radius = radius * pulse_scale

        painter.setBrush(QColor(glow_color.red(), glow_color.green(), glow_color.blue(), 30))
        painter.setPen(Qt.PenStyle.NoPen)
        painter.drawEllipse(QPoint(center_x, center_y), int(glow_radius + 4), int(glow_radius + 4))

        # 2. Body Disc
        painter.setBrush(bg_color)
        pen_width = 3 if self.is_hovered else 2
        painter.setPen(QPen(glow_color, pen_width))
        painter.drawEllipse(QPoint(center_x, center_y), radius, radius)

        # 3. Eyes
        eye_y = center_y - 2
        eye_offset_x = 11
        eye_width = 8
        eye_height = max(2, int(12 * (1.0 - self.blink_state * 0.9)))

        painter.setBrush(glow_color)
        painter.setPen(Qt.PenStyle.NoPen)

        # Left eye
        painter.drawRoundedRect(
            center_x - eye_offset_x - (eye_width // 2),
            eye_y - (eye_height // 2),
            eye_width,
            eye_height,
            3, 3
        )

        # Right eye
        painter.drawRoundedRect(
            center_x + eye_offset_x - (eye_width // 2),
            eye_y - (eye_height // 2),
            eye_width,
            eye_height,
            3, 3
        )

        # 4. Smile line
        if self.blink_state < 0.5:
            painter.setPen(QPen(glow_color, 1.8, Qt.PenStyle.SolidLine, Qt.PenCapStyle.RoundCap))
            path = QPainterPath()
            path.moveTo(center_x - 5, center_y + 13)
            path.quadTo(center_x, center_y + 17, center_x + 5, center_y + 13)
            painter.drawPath(path)

        # 5. Snip Icon Badge on hover
        if self.is_hovered:
            badge_rect = QRect(center_x + 15, center_y - 27, 20, 20)
            painter.setBrush(QColor(14, 165, 233))
            painter.setPen(Qt.PenStyle.NoPen)
            painter.drawEllipse(badge_rect)
            painter.setPen(Qt.GlobalColor.white)
            painter.setFont(QFont("Segoe UI", 9, QFont.Weight.Bold))
            painter.drawText(badge_rect, Qt.AlignmentFlag.AlignCenter, "✂")
