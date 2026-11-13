# AI-Based Vehicle Damage Assessment and Insurance Claim Assistance

Final-Year B.Tech Computer Science and Engineering Capstone Project.

A mobile-first web application designed to help vehicle owners document vehicle damage, organize insurance documents, obtain transparent indicative repair estimates, and generate structured claim-assistance reports following a road accident.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4 (`@import "tailwindcss";`), Lucide Icons, Motion.
- **Backend & Persistence**: Firebase Realtime Database (RTDB) & Firebase Authentication (Email/Password).
- **Server API**: Express proxy (`server.ts`) for `@google/genai` (Gemini 4 Argon vision analysis).
- **In-Browser Processing & Libraries**:
  - `onnxruntime-web` for local ONNX computer vision inference adapter (`/public/models/vehicle_damage_yolo.onnx`).
  - `tesseract.js` for local in-browser OCR (Vehicle RC, Insurance Policy, DL, Death Certificates).
  - `jspdf` for local PDF report bundle generation.
  - Browser IndexedDB for device-local high-resolution original evidence retention.
  - Web Speech API for speech-to-text input (English, Hindi, Marathi).

---

## 🚀 Prerequisites & Installation

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation
```bash
# Install dependencies
npm install

# Run backend express server and vite frontend
npm run dev
```

### Production Build
```bash
npm run build
```

---

## 🔐 Firebase Realtime Database Setup & Security Rules

1. Create a free Firebase project on the **Spark Plan**.
2. Enable **Authentication** -> **Email/Password**.
3. Enable **Realtime Database**.
4. Deploy the supplied security rules from `database.rules.json`:

```bash
firebase deploy --only database
```

### `.env` Setup
Create `.env` using `.env.example`:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="MY_APP_URL"

VITE_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="YOUR_PROJECT_ID.firebaseapp.com"
VITE_FIREBASE_DATABASE_URL="https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="YOUR_PROJECT_ID.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
VITE_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"

# Configured Administrator UIDs (Comma-separated)
VITE_ADMIN_UIDS="ADMIN_UID_1,ADMIN_UID_2"
```

---

## 🤖 Optional Local ONNX Model Setup

To use local ONNX inference:
1. Place a trained YOLOv8 ONNX model in `public/models/vehicle_damage_yolo.onnx`.
2. Expected model input tensor: `[1, 3, 640, 640]` float32 normalized RGB image.
3. Supported output labels: `Front Bumper`, `Rear Bumper`, `Bonnet`, `Door`, `Headlight`, `Fender`, `Windscreen`.
4. If no ONNX model is present, the app honestly displays "AI model not configured" and provides a full manual assessment mode.

---

## 🧪 Testing

Run deterministic business logic unit tests (cost calculations and severity classification):

```bash
npx --yes tsx --test src/services/cost-estimation/calculator.test.ts src/services/ai/severityMapping.test.ts
```

---

## ⚖️ Disclaimer

*This application is an academic engineering capstone project. All AI vision predictions, manual damage entries, OCR outputs, and cost ranges are preliminary and indicative only. Final claim approval, surveyor inspection, and payouts remain under the exclusive authority of the licensed insurance company.*
