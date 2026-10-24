from PyQt6.QtCore import Qt, QRect, QPoint, pyqtSignal, QBuffer, QIODevice
from PyQt6.QtGui import QPainter, QPen, QColor, QBrush, QFont, QPainterPath, QCursor
from PyQt6.QtWidgets import QWidget, QApplication

class SnippingOverlay(QWidget):
    """
    Transparent fullscreen overlay for circling or box-selecting
    regions on the screen (equations, charts, code, text).
    """
    # Emits (image_bytes: bytes, screen_rect: QRect)
    region_selected = pyqtSignal(bytes, QRect)
    canceled = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint |
            Qt.WindowType.WindowStaysOnTopHint |
            Qt.WindowType.Tool
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        self.setCursor(Qt.CursorShape.CrossCursor)

        self.start_pos = None
        self.current_pos = None
        self.path_points = []
        self.is_lasso = False

    def start_selection(self):
        """Displays overlay over all screens."""
        screen = QApplication.primaryScreen()
        geo = screen.virtualGeometry()
        self.setGeometry(geo)
        self.start_pos = None
        self.current_pos = None
        self.path_points = []
        self.is_lasso = False
        self.show()
        self.raise_()
        self.activateWindow()

    def keyPressEvent(self, event):
        if event.key() == Qt.Key.Key_Escape:
            self.hide()
            self.canceled.emit()
        else:
            super().keyPressEvent(event)

    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self.start_pos = event.pos()
            self.current_pos = event.pos()
            self.path_points = [event.pos()]
            self.update()

    def mouseMoveEvent(self, event):
        if self.start_pos:
            self.current_pos = event.pos()
            self.path_points.append(event.pos())
            # If path points wander enough, it behaves like a freehand lasso
            if len(self.path_points) > 15:
                self.is_lasso = True
            self.update()

    def mouseReleaseEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton and self.start_pos:
            rect = self._compute_bounding_rect()
            self.hide()
            
            # Require minimum selection size (avoid accidental tiny clicks)
            if rect.width() > 10 and rect.height() > 10:
                self._capture_and_emit(rect)
            else:
                self.canceled.emit()

    def _compute_bounding_rect(self) -> QRect:
        if self.is_lasso and len(self.path_points) > 5:
            xs = [p.x() for p in self.path_points]
            ys = [p.y() for p in self.path_points]
            return QRect(min(xs), min(ys), max(xs) - min(xs), max(ys) - min(ys))
        elif self.start_pos and self.current_pos:
            return QRect(self.start_pos, self.current_pos).normalized()
        return QRect()

    def _capture_and_emit(self, rect: QRect):
        # Allow Windows DWM a tiny moment to remove overlay
        QApplication.processEvents()

        screen = QApplication.primaryScreen()
        # Grab exact window region
        pixmap = screen.grabWindow(0, rect.x(), rect.y(), rect.width(), rect.height())

        # Scale down if very large to minimize transfer & vision latency
        if pixmap.width() > 1000 or pixmap.height() > 1000:
            pixmap = pixmap.scaled(
                1000, 1000,
                Qt.AspectRatioMode.KeepAspectRatio,
                Qt.TransformationMode.SmoothTransformation
            )

        buf = QBuffer()
        buf.open(QIODevice.OpenModeFlag.ReadWrite)
        # Use high-quality JPEG (85%): 10x smaller payload, 4x faster upload
        pixmap.save(buf, "JPEG", 85)
        image_bytes = buf.data().data()
        buf.close()

        self.region_selected.emit(image_bytes, rect)

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)

        # 1. Dark semi-transparent scrim over screen
        painter.fillRect(self.rect(), QColor(10, 15, 25, 95))

        # 2. Draw instructions banner if user hasn't clicked yet
        if not self.start_pos:
            banner_rect = QRect(self.width() // 2 - 240, 60, 480, 52)
            painter.setBrush(QColor(11, 15, 25, 240))
            painter.setPen(QPen(QColor(0, 240, 255), 1.8))
            painter.drawRoundedRect(banner_rect, 12, 12)

            painter.setPen(QColor(241, 245, 249))
            font = QFont("Segoe UI", 12, QFont.Weight.DemiBold)
            painter.setFont(font)
            painter.drawText(banner_rect, Qt.AlignmentFlag.AlignCenter, "⭕ Circle any equation or text on your PDF  •  [ESC] Cancel")
            return

        # 3. Draw active selection
        if self.is_lasso and len(self.path_points) > 1:
            # Draw glowing lasso curve
            path = QPainterPath()
            path.moveTo(self.path_points[0].x(), self.path_points[0].y())
            for pt in self.path_points[1:]:
                path.lineTo(pt.x(), pt.y())

            # Glow effect
            painter.setPen(QPen(QColor(0, 240, 255, 60), 8))
            painter.drawPath(path)

            # Main sharp stroke
            painter.setPen(QPen(QColor(0, 240, 255), 2.5, Qt.PenStyle.SolidLine))
            painter.drawPath(path)

            # Floating helper tag near cursor
            cur = self.path_points[-1]
            tag_rect = QRect(cur.x() + 14, cur.y() + 14, 180, 26)
            painter.setBrush(QColor(11, 15, 25, 230))
            painter.setPen(QPen(QColor(0, 240, 255), 1))
            painter.drawRoundedRect(tag_rect, 6, 6)
            painter.setPen(QColor(0, 240, 255))
            painter.setFont(QFont("Segoe UI", 9, QFont.Weight.Bold))
            painter.drawText(tag_rect, Qt.AlignmentFlag.AlignCenter, "✨ Release mouse to solve")

        elif self.start_pos and self.current_pos:
            rect = QRect(self.start_pos, self.current_pos).normalized()
            
            # Clear cut-out effect inside selection
            painter.setCompositionMode(QPainter.CompositionMode.CompositionMode_Clear)
            painter.fillRect(rect, Qt.GlobalColor.transparent)
            painter.setCompositionMode(QPainter.CompositionMode.CompositionMode_SourceOver)

            # Outer glow
            painter.setPen(QPen(QColor(14, 165, 233, 90), 6))
            painter.drawRoundedRect(rect, 6, 6)

            # Sharp border
            painter.setPen(QPen(QColor(56, 189, 248), 2, Qt.PenStyle.DashLine))
            painter.drawRoundedRect(rect, 6, 6)

            # Size indicator tag
            tag_text = f"{rect.width()} × {rect.height()} px"
            tag_rect = QRect(rect.x() + 8, max(rect.y() - 28, 10), 100, 22)
            painter.setBrush(QColor(15, 23, 42, 220))
            painter.setPen(Qt.PenStyle.NoPen)
            painter.drawRoundedRect(tag_rect, 5, 5)

            painter.setPen(QColor(224, 242, 254))
            painter.setFont(QFont("Segoe UI", 9, QFont.Weight.DemiBold))
            painter.drawText(tag_rect, Qt.AlignmentFlag.AlignCenter, tag_text)
