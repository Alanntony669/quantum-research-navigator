# 🌌 Quantum Research Navigator

A modern, high-performance web application designed to explore, navigate, and manage cutting-edge quantum computing & physics research.

---

## ✨ Features

- 🔍 **Live arXiv Integration**: Search and query research papers in quantum physics (`quant-ph`, `cs.QC`, etc.) in real time.
- 📂 **Research Categories**: Browse specialized subfields like Quantum Algorithms, Quantum Cryptography, Error Correction, Simulation, and Hardware.
- 📑 **Curated Bookmarks**: Save and organize papers into a persistent reading list.
- 📄 **Research Document & Notes Upload**: Upload your own research papers, notes, and briefs (`.pdf`, `.txt`, `.md`, `.docx`) with tags, metadata, and instant download/delete.
- 🧠 **Quantum Glossary**: Interactive encyclopedia with 25+ essential quantum concepts, mathematical explanations, and related terms.
- 🎨 **Futuristic UI**: Deep space dark mode, glassmorphic cards, glowing particle effects, and responsive navigation powered by TailwindCSS & Framer Motion.

---

## 🚀 Quick Start

### 1. One-Click Launch
Double-click `start-all.bat` in the project root directory.

### 2. Manual Startup

#### Backend (FastAPI):
```bash
cd backend
python3.12 -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- API Docs & Swagger UI: `http://localhost:8000/docs`

#### Frontend (React + Vite + TailwindCSS):
```bash
cd frontend
npm.cmd run dev
```
- App UI: `http://localhost:5173`
