# UPYOG Property Tax Analytics Dashboard 🏛️📊

Welcome to the **Property Tax Analytics Dashboard** developed for the **UPYOG** multi-tenant civic services platform. 

This modern single-page dashboard serves 10 major Indian cities, offering real-time metric analysis, visual comparisons, and a built-in AI conversational assistant powered by Google Gemini to answer questions about the property tax dataset.

---

## ✨ Features

- **🌐 Multi-Tenant Dropdown Filter:** Toggle seamlessly between `All Cities` or individual cities (Delhi, Mumbai, Bengaluru, Pune, Chennai, Hyderabad, Ahmedabad, Kolkata, Jaipur, Lucknow) to filter all data dynamically.
- **⚡ Live KPI Indicators:** Real-time updates for:
  - **Total Properties Registered**
  - **Total Properties Approved**
  - **Total Properties Rejected**
  - **Total Property Tax Collection (INR)**
- **📈 Visual Analytics & Side-by-Side Comparison:** Responsive bar and pie charts comparing tax collections and statuses across all 10 cities side-by-side.
- **💬 AI Chat Assistant (Google Gemini):** A contextual conversational chatbox where municipal operators can ask natural language questions (e.g., *"Which city has the highest collection?"* or *"What percentage of properties in Mumbai are rejected?"*) and receive accurate, instant answers.
- **🎨 Premium Visual Experience:** Immersive Dark Mode visual architecture, dynamic glassmorphic card elements, subtle hover micro-animations, and fluid transitions.

---

## 🛠️ Technology Stack

- **Frontend Core:** React, TypeScript, Vite
- **Styling:** CSS3 (Modern Flexbox/Grid, CSS Variables, Glassmorphism, Responsive Media Queries)
- **Charts:** Recharts (Responsive SVG Charts)
- **AI Integration:** Google Gemini API (`@google/genai` or standard SDK integration)
- **Icons:** Lucide React

---

## 🚀 Setup & Installation Instructions

Follow these simple steps to set up and run the dashboard locally:

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and **npm** installed on your system.

### 2. Clone the Repository
```bash
git clone https://github.com/Tushar6394/nudm-property-tax-dashboard.git
cd nudm-property-tax-dashboard
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
1. Create a `.env` file in the root directory:
   ```bash
   touch .env
   ```
2. Open `.env` and add your **Google Gemini API Key** (get one free from [Google AI Studio](https://aistudio.google.com/)):
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

> **Note:** The `.env` file is excluded from git tracking via `.gitignore` to keep your credentials secure.

### 5. Launch the Development Server
Run the following command to start the app:
```bash
npm run dev
```
Once started, open [http://localhost:5173](http://localhost:5173) in your browser to view the dashboard!

---

## 📁 Project Structure
```text
├── public/
│   └── properties.json         # Main property tax dataset
├── src/
│   ├── assets/                 # SVGs and static media assets
│   ├── components/             # Reusable UI components (KPIs, Chat, Charts)
│   ├── hooks/                  # Custom state hooks for data parsing
│   ├── services/               # Google Gemini API integration
│   ├── types.ts                # TypeScript data interfaces
│   ├── App.tsx                 # Main application dashboard controller
│   ├── main.tsx                # React virtual DOM injection point
│   └── index.css               # Core CSS design system and variables
├── .env                        # Local environment secrets (ignored)
├── .gitignore                  # Git untracked registry
├── package.json                # Project manifest and scripts
├── tsconfig.json               # TypeScript compiler config
└── vite.config.ts              # Vite bundler configuration
```

---

## 🏛️ About the UPYOG Platform
**UPYOG** is an open-source, multi-tenant digital platform built to empower Indian urban local bodies (ULBs) and municipalities. It facilitates smooth, scalable citizen service delivery, including property tax collections, trade licenses, water connections, and grievance redressal across diverse states and cities.
