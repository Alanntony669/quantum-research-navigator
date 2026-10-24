# 🤖 Clicky for Windows — Desktop AI Buddy

A screen-aware AI companion for Windows inspired by **HeyClicky** (macOS). Circle any math equation, code snippet, chart, or text on your desktop using a shortcut (`Alt + C`), and Clicky derives the step-by-step solution, renders formulas in LaTeX, points an arrow at the equation, and lets you ask follow-up questions.

---

## ✨ Features

- **Floating Animated Desktop Companion**:
  - Sits on your desktop with idle breathing animations, blinking eyes, and glowing aura.
  - Draggable anywhere on screen.
  - Changes state dynamically: 🟢 *Idle*, 🟡 *Snipping*, 🟣 *Thinking/Deriving*.
  - Left-click triggers snip mode; right-click opens settings.

- **Neon Lasso & Screen Snipping (`Alt + C`)**:
  - Fullscreen transparent overlay with dark scrim.
  - Supports both **bounding box drag** and **freehand luminous lasso circling**.
  - Shows real-time dimension tags (`480 × 160 px`).
  - Native Windows DPI scaling support (`SetProcessDpiAwareness(2)`).

- **"Write on PDF / Screen" In-Place HUD**:
  - Docks an interactive card right beside the captured equation.
  - Renders beautiful formatted math with **KaTeX** ($LaTeX$).
  - Explains **why the value of $x$ is derived** and gives the final solution in a prominent callout.
  - Interactive **Follow-up Chat Input**: Type questions like *"Why did you factor step 2?"* and Clicky responds with the visual context in mind.
  - One-click **Copy Solution** button.

- **Multimodal AI Engine**:
  - Powered by **Google Gemini** (`gemini-2.5-flash` / `gemini-2.0-flash`) or **OpenAI** (`gpt-4o`).
  - Built-in **Demo Derivation Mode** so you can test the complete UI and workflow without an API key immediately.

---

## 🚀 Quick Start

### 1. Launch Clicky
Double-click `run.bat` or run via PowerShell:

```powershell
cd C:\Users\ASUS\.gemini\antigravity\scratch\heyclicky-windows
.\launch.ps1
```

### 2. Try with the Test Equation
Open a sample practice equation to try it out:

```powershell
.venv\Scripts\python.exe generate_sample_math.py
```

1. Press **`Alt + C`** (or left-click your floating Clicky buddy).
2. Drag or circle around the equation on your screen.
3. Release the mouse.
4. Watch Clicky analyze the problem and pop up the step-by-step LaTeX derivation right next to your equation!

---

## ⚙️ Configuration (Gemini & OpenAI API Keys)

Right-click the Clicky companion or click the system tray icon and select **Settings (⚙️)**:
- Select **Gemini** (recommended for ultra-low latency) or **OpenAI**.
- Paste your API key (e.g. from [Google AI Studio](https://aistudio.google.com/)).
- Custom hotkey (default: `<alt>+c`).

You can also set environment variables:
```bash
set GEMINI_API_KEY=your_key_here
```

---

## 📂 Project Architecture

```
heyclicky-windows/
├── main.py                 # App entry point, system tray, & event coordinator
├── buddy_widget.py         # Floating animated AI companion (blinking eyes, glow)
├── snipping_overlay.py     # Transparent fullscreen canvas with neon lasso & box selector
├── annotation_hud.py       # In-place floating solution card with KaTeX rendering & follow-up chat
├── ai_engine.py            # Multimodal vision handler (Gemini 2.5 Flash / OpenAI / Demo)
├── hotkey_manager.py       # Global background hotkey listener (pynput)
├── settings_dialog.py      # Settings UI for API keys & preferences
├── config.py               # Local settings persistence (~/.clicky_windows/config.json)
├── generate_sample_math.py # Test helper window with sample math problems
├── run.bat                 # 1-click Windows batch runner
└── launch.ps1              # PowerShell launcher
```

---

## 🧠 macOS vs. Windows: How it Works Under the Hood

| Capability | macOS (HeyClicky) | Windows (This Implementation) |
| :--- | :--- | :--- |
| **Global Trigger** | `CGEventTap` / Carbon API | `pynput` keyboard hooks + Qt event bridge |
| **Screen Capture** | `ScreenCaptureKit` | `QScreen.grabWindow(0)` via Windows DWM compositor |
| **High DPI** | Quartz Retina coordinate scaling | `SetProcessDpiAwareness(2)` (Per-Monitor Aware V2) |
| **Transparent HUD** | Borderless `NSWindow` (`kCGOverlayWindowLevel`) | Qt Frameless translucent window with `WA_TranslucentBackground` |
| **Math Rendering** | Metal / SwiftUI / WebKit | Chromium QtWebEngine with KaTeX LaTeX engine |
