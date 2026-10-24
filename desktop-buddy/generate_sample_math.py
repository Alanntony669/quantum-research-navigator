"""
Helper script: Displays a floating mock math sheet on screen so you can immediately
test circling an equation with Clicky (Alt+C) and watch it derive the solution!
"""
import sys
from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QApplication, QWidget, QVBoxLayout, QLabel

def show_sample_window():
    app = QApplication(sys.argv)
    window = QWidget()
    window.setWindowTitle("📝 Math Worksheet - Test Equation")
    window.resize(500, 320)
    window.setStyleSheet("""
        QWidget {
            background-color: #ffffff;
            color: #1e293b;
            font-family: 'Cambria Math', 'Times New Roman', serif;
        }
    """)

    layout = QVBoxLayout(window)
    layout.setContentsMargins(40, 30, 40, 30)

    title = QLabel("Calculus & Algebra Practice Sheet")
    title.setStyleSheet("font-size: 20px; font-weight: bold; color: #0f172a; margin-bottom: 10px;")
    layout.addWidget(title)

    desc = QLabel("Instructions: Press Alt+C (or click your Clicky buddy) and circle the equation below:")
    desc.setStyleSheet("font-size: 13px; color: #64748b; font-family: 'Segoe UI', sans-serif;")
    layout.addWidget(desc)

    layout.addSpacing(20)

    eq_box = QLabel("Problem 1:\nFind the values of x satisfying:\n\n    2x² - 8x - 24 = 0")
    eq_box.setStyleSheet("""
        font-size: 22px;
        color: #0369a1;
        background-color: #f0f9ff;
        border: 2px dashed #38bdf8;
        border-radius: 8px;
        padding: 20px;
    """)
    layout.addWidget(eq_box)

    layout.addStretch()

    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    show_sample_window()
