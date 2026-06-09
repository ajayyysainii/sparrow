<div align="center">

# Sparrow

**AI Voice Coaching Platform — real-time speech analysis, ML-driven scoring, and session-level vocal analytics**

[Features](#key-features) ·
[Installation](#installation--setup) ·
[Usage](#usage) ·
[Pipeline](#how-it-works--ml-pipeline) ·
[Contributing](#contributing)

</div>

---

## Table of Contents

- [About / Overview](#about--overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [How It Works — ML Pipeline](#how-it-works--ml-pipeline)
- [Results / Performance](#results--performance)
- [Contributing](#contributing)
- [License](#license)
- [Authors](#authors)

---

## About / Overview

**Sparrow** is an end-to-end AI voice coaching platform that analyzes spoken audio, extracts acoustic biomarkers, classifies vocal health, and delivers structured coaching feedback. The system combines classical **signal processing** and **librosa**-based feature extraction with a deep learning classification pipeline, wrapped in a full-stack web application for live coaching sessions, guided exercises, and longitudinal progress tracking.

At its core, Sparrow:

1. **Ingests** voice recordings (WAV) from health checks or coaching calls
2. **Extracts** pitch, clarity, pacing, jitter, shimmer, HNR, MFCCs, and spectral descriptors
3. **Classifies** vocal condition via a trained neural network (Healthy · Laryngitis · Vocal Polyp)
4. **Generates** LLM-powered narrative reports with clinical reference ranges
5. **Tracks** session-level metrics over time through a MongoDB-backed analytics dashboard

> **Note:** Sparrow is designed for coaching and research workflows. Automated voice analysis is not a substitute for professional medical diagnosis.

---

## Key Features

| Module | Capability |
|--------|------------|
| **Acoustic Analysis** | Pitch (F0), jitter, shimmer, HNR, formants, MFCCs, spectral centroid/bandwidth/rolloff |
| **ML Classification** | Multi-class vocal health scoring with per-class confidence |
| **Coaching Feedback** | Groq LLM-generated structured reports + rule-based fallback analysis |
| **Voice Health Check** | Upload WAV → PDF report + JSON diagnostics via Cloudinary |
| **AI Voice Calls** | Vapi-powered live coaching conversations with post-call analytics |
| **Guided Exercises** | 9 vocal exercises (breathing, pitch, diction, tongue twisters, lip trills) |
| **Session Analytics** | Dashboard with jitter/shimmer trends, prediction distribution, streaks & points |
| **Voice Chatbot** | Domain-specific Sparrow assistant for vocal health Q&A |

---

## Tech Stack

### ML & Signal Processing

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Librosa](https://img.shields.io/badge/Librosa-Audio_Features-FF6F00?logo=python&logoColor=white)](https://librosa.org/)
[![NumPy](https://img.shields.io/badge/NumPy-Signal_Processing-013243?logo=numpy&logoColor=white)](https://numpy.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-Feature_Pipeline-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-Keras_LSTM-FF6F00?logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)
[![VGGish](https://img.shields.io/badge/VGGish-TF_Hub_Embeddings-4285F4?logo=google&logoColor=white)](https://tfhub.dev/google/vggish/1)

### Backend & Infrastructure

[![Flask](https://img.shields.io/badge/Flask-AI_Service-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Analytics-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Groq](https://img.shields.io/badge/Groq-LLM_Inference-F55036)](https://groq.com/)

### Frontend

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-Dashboard-22C55E)](https://recharts.org/)

---

## Project Structure

```
sparrow/
├── ai/                              # Python ML & inference service (Flask)
│   ├── main.py                      # Flask entry point (port 8080)
│   ├── app/
│   │   ├── __init__.py              # Model loading, Cloudinary, Groq client
│   │   ├── audio_bp.py              # /api/chat, /api/process_audio routes
│   │   ├── report_generation.py     # Feature extraction, inference, PDF/JSON reports
│   │   └── lsm_model3/              # Saved TensorFlow Bidirectional LSTM classifier
│   └── whatsapp.py                  # Optional Twilio WhatsApp integration
│
├── server/                          # Node.js REST API (Express + MongoDB)
│   └── src/
│       ├── index.js                 # Server bootstrap
│       ├── app.js                   # Route module registry
│       ├── config/connectDB.js      # MongoDB connection
│       ├── controllers/             # auth, call, stats, aimodel, payment
│       ├── middlewares/             # JWT authentication
│       ├── models/                  # User, Call, Report, VoiceHealthReport, UserStats
│       └── routes/                  # /auth, /call, /stats, /aimodel, /payment
│
├── client/                          # React + TypeScript SPA (Vite)
│   └── src/
│       ├── App.tsx                  # Router & protected routes
│       ├── pages/                   # Dashboard, Call, Exercises, Landing, HealthCheck
│       ├── components/              # UI, exercises, reports, Vapi widget
│       ├── contexts/AuthContext.tsx # JWT auth state
│       └── hooks/                   # Breathing exercise logic
│
├── SETUP.md                         # Legacy voice-assistant setup notes
└── README.md                        # This file
```

---

## Installation & Setup

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| MongoDB | 6+ (local or Atlas) |
| FFmpeg | Required by librosa for audio I/O |

### 1. Clone the repository

```bash
git clone https://github.com/ajayyysainii/sparrow.git
cd sparrow
```

### 2. AI service (Python / Flask)

```bash
cd ai
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install flask flask-cors python-dotenv tensorflow tensorflow-hub \
            librosa numpy matplotlib fpdf2 groq cloudinary werkzeug
```

Create `ai/.env`:

```env
GROQ_API_KEY=your_groq_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

Start the AI service:

```bash
python main.py
# Runs at http://localhost:8080
```

> On first run, VGGish embeddings are downloaded from TensorFlow Hub (~280 MB).

### 3. Backend API (Node.js / Express)

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/sparrow
JWT_SECRET=your_jwt_secret
AI_MODEL_URL=http://localhost:8080
GROQ_API_KEY=your_groq_api_key
VAPI_API_KEY_PRIVATE=your_vapi_private_key
```

Start the API:

```bash
npm run dev
# Runs at http://localhost:4000
```

### 4. Frontend (React / Vite)

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:4000
VITE_VAPI_API_KEY=your_vapi_public_key
VITE_VAPI_API_KEY_PRIVATE=your_vapi_private_key
VITE_ASSISTANT_ID=your_vapi_assistant_id
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key   # optional
VITE_OPENAI_API_KEY=your_openai_key           # optional
```

Start the dev server:

```bash
npm run dev
# Runs at http://localhost:5173
```

### 5. Verify the stack

```bash
# Test chat endpoint
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is vocal jitter?"}'

# Backend health
curl http://localhost:4000/
```

---

## Usage

### Voice health analysis (API)

Upload a 16 kHz mono WAV file for full acoustic analysis and classification:

```bash
curl -X POST http://localhost:8080/api/process_audio \
  -F "audio=@sample.wav"
```

**Response (abbreviated):**

```json
{
  "Prediction": "Healthy",
  "Confidence Scores": {
    "Healthy": "87.32%",
    "Laryngitis": "8.14%",
    "Vocal Polyp": "4.54%"
  },
  "Acoustic Features": {
    "Jitter_Percent": 0.42,
    "Shimmer_Percent": 2.18,
    "MFCC_Mean": [/* 13 coefficients */],
    "MFCC_Std": [/* 13 coefficients */]
  },
  "Findings": "... structured coaching / clinical narrative ...",
  "PDF_URL": "https://res.cloudinary.com/..."
}
```

### Programmatic pipeline (Python)

```python
from app.report_generation import process_audio
import json

report_json = process_audio("path/to/recording.wav")
report = json.loads(report_json)

print(report["diagnosis"]["predicted_condition"])
print(report["acoustic_analysis"]["voice_perturbation"]["jitter"]["value"])
```

### Authenticated health check (via Node proxy)

```bash
curl -X POST http://localhost:4000/aimodel/process_audio \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "audio=@sample.wav"
```

Reports are persisted to MongoDB and surfaced in the dashboard at `/dashboard`.

### Web application workflows

1. **Sign up / Log in** → `/signup`, `/login`
2. **Voice Health Check** → `/dashboard/health-check` — upload audio, view PDF report
3. **AI Coaching Call** → `/dashboard/call` — live Vapi session with post-call report
4. **Exercises** → `/dashboard/breathing/*` — guided vocal drills with streak tracking
5. **Analytics** → `/dashboard` — jitter/shimmer trends, prediction breakdown, call history

---

## How It Works — ML Pipeline

```
┌─────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│  WAV Input  │───▶│  Feature Extraction  │───▶│  Classification     │
│  (16 kHz)   │    │  (Librosa + VGGish)  │    │  (Bi-LSTM / TF)     │
└─────────────┘    └──────────────────────┘    └─────────────────────┘
                              │                           │
                              ▼                           ▼
                   ┌──────────────────────┐    ┌─────────────────────┐
                   │  Acoustic Features   │    │  Confidence Scores  │
                   │  jitter · shimmer    │    │  Healthy            │
                   │  HNR · F0 · MFCCs    │    │  Laryngitis         │
                   │  spectral · formants │    │  Vocal Polyp        │
                   └──────────────────────┘    └─────────────────────┘
                              │                           │
                              └───────────┬───────────────┘
                                          ▼
                              ┌───────────────────────┐
                              │  Scoring & Feedback   │
                              │  LLM report + PDF     │
                              │  clinical ranges      │
                              └───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │  Session Analytics    │
                              │  MongoDB time-series  │
                              │  dashboard charts     │
                              └───────────────────────┘
```

### Stage 1 — Feature extraction (signal processing)

**Librosa** loads audio at 16 kHz and computes:

| Feature | Method | Coaching relevance |
|---------|--------|-------------------|
| **Pitch (F0)** | `librosa.pyin` | Pacing, intonation, vocal strain |
| **Jitter** | Period-to-period F0 variation | Vocal fold stability |
| **Shimmer** | Amplitude envelope variation | Clarity, breath support |
| **HNR** | Harmonic-percussive separation | Voice quality / breathiness |
| **MFCCs** | 13-coefficient mel cepstra | Timbre & articulation |
| **Spectral** | Centroid, bandwidth, rolloff, contrast | Brightness & resonance |
| **Formants** | LPC root analysis | Vowel resonance (F1) |

**VGGish** (TensorFlow Hub) produces 128-dimensional frame embeddings, padded/truncated to `(128, 128)` for the sequence classifier.

Feature vectors are structured in a **scikit-learn-compatible tabular format** (fixed-length numeric arrays) for downstream ML scoring.

### Stage 2 — Classification (TensorFlow / Keras)

The production model (`ai/app/lsm_model3`) is a **Bidirectional LSTM** network:

- **Input shape:** `(batch, 128, 128)` — VGGish embedding sequences
- **Architecture:** Bidirectional LSTM (128 units) → Dense softmax
- **Output classes:** `Healthy` · `Laryngitis` · `Vocal Polyp`
- **Inference:** argmax over softmax probabilities → confidence percentages

```python
# Simplified inference flow (see app/report_generation.py)
vggish_features = extract_audio_features(audio_path)       # (128, 128)
acoustic_features = extract_advanced_features(audio_path)  # librosa dict
logits = model(np.expand_dims(vggish_features, 0))         # TensorFlow SavedModel
predicted_class = label_mapping[np.argmax(logits)]
```

### Stage 3 — Scoring & structured feedback

1. **Confidence scores** — per-class softmax probabilities ranked descending
2. **Clinical range check** — parameters compared against published norms:

   | Parameter | Normal range |
   |-----------|--------------|
   | Jitter | 0 – 1.04 % |
   | Shimmer | 0 – 3.81 % |
   | HNR | 12 – 30 dB |
   | F0 (male) | 85 – 180 Hz |
   | F0 (female) | 165 – 255 Hz |

3. **Narrative report** — Groq LLM (`mixtral-8x7b-32768`) with deterministic fallback when API is unavailable
4. **Deliverables** — JSON report, PDF with spectrogram visualizations, Cloudinary-hosted PDF URL

### Stage 4 — Session-level analytics

The Express `/stats` module aggregates `VoiceHealthReport` documents per user:

- Weekly **jitter** and **shimmer** trend lines
- **Prediction distribution** pie chart
- Exercise **streaks**, **points**, and completion tracking
- Call history with sentiment, confidence, and vocabulary richness metrics

---

## Results / Performance

### Model architecture

| Property | Value |
|----------|-------|
| Embedding model | Google VGGish (TF Hub) |
| Classifier | Bidirectional LSTM, 128 units |
| Input | 128 × 128 VGGish sequence |
| Classes | 3 (Healthy, Laryngitis, Vocal Polyp) |
| Training metric | Categorical accuracy (Keras) |

> **Benchmark note:** Published hold-out accuracy, precision, and recall metrics are not yet included in this repository. Re-run evaluation on your validation set and update this section with your results table.

### Clinical reference alignment

Acoustic thresholds in `report_generation.py` follow established voice pathology literature (jitter ≤ 1.04 %, shimmer ≤ 3.81 %, HNR ≥ 12 dB). PDF reports color-code parameters green/red against these ranges.

### Platform capabilities (validated in development)

| Capability | Status |
|------------|--------|
| End-to-end WAV → PDF pipeline | ✅ |
| Real-time coaching via Vapi | ✅ |
| Dashboard analytics (Recharts) | ✅ |
| 9 guided vocal exercises | ✅ |
| JWT auth + MongoDB persistence | ✅ |

---

## Contributing

Contributions are welcome. Please follow these steps:

1. **Fork** the repository and create a feature branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Install** all three services locally (see [Installation](#installation--setup))
3. **Follow existing conventions** — TypeScript strict mode on the client, ES modules on the server, Flask blueprints in `ai/`
4. **Run linters** before submitting
   ```bash
   cd client && npm run lint
   ```
5. **Open a Pull Request** with a clear description, linked issues, and screenshots for UI changes

### Development guidelines

- Keep ML inference logic in `ai/app/report_generation.py`; route handlers stay thin in `audio_bp.py`
- Never commit `.env` files, API keys, or model weights not already in the repo
- Prefer minimal, focused diffs — match surrounding code style
- Add tests when introducing new API endpoints or feature extractors

---


## Authors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/ajayyysainii">
        <img src="https://github.com/ajayyysainii.png" width="100px;" alt="Ajay Saini"/><br />
        <sub><b>Ajay Saini</b></sub>
      </a><br />
      <a href="https://github.com/ajayyysainii">@ajayyysainii</a>
    </td>
    <td align="center">
      <a href="https://github.com/Anshuverma05">
        <img src="https://github.com/Anshuverma05.png" width="100px;" alt="Anshu Verma"/><br />
        <sub><b>Anshu Verma</b></sub>
      </a><br />
      <a href="https://github.com/Anshuverma05">@Anshuverma05</a>
    </td>
    <td align="center">
      <a href="https://github.com/arnav-144p">
        <img src="https://github.com/arnav-144p.png" width="100px;" alt="Arnav Bhilwariya"/><br />
        <sub><b>Arnav Bhilwariya</b></sub>
      </a><br />
      <a href="https://github.com/arnav-144p">@arnav-144p</a>
    </td>
    <td align="center">
      <a href="https://github.com/sarthakdixit7376">
        <img src="https://github.com/sarthakdixit7376.png" width="100px;" alt="Sarthak Dixit"/><br />
        <sub><b>Sarthak Dixit</b></sub>
      </a><br />
      <a href="https://github.com/sarthakdixit7376">@sarthakdixit7376</a>
    </td>
  </tr>
</table>

<div align="center">

**Built with precision for voice coaches, researchers, and developers.**

</div>