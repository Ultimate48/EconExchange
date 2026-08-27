# Econ Exchange — Frontend

A state-of-the-art, Zerodha Kite-inspired financial trading platform and investment management exchange built for TIET Econ Club. 

Designed with modern financial web aesthetics, fluid micro-interactions, responsive grid layouts, and real-time portfolio analytics.

---

## 🌟 Key Features

- **📊 Summary KPI Dashboard**:
  - 4 uniform, equal-height metrics cards displaying **Cash Available**, **Holdings Value**, **Portfolio Value**, and **Portfolio Return & P&L** (with clear distinction between overall capital growth and unrealized positions P&L).
  - Gradient performance area chart powered by Recharts.

- **🔍 Interactive Trade Details Modal**:
  - Zerodha Kite-style modal dialog for inspecting complete trade audit records.
  - Displays Order Rate / Settled Price, Quantity, Total Order Value (`Qty * Rate`), Order Type (`MARKET`/`LIMIT`), Timestamps, Rationale, and resolved Member Names in private workspace views.
  - Contextual anonymity in public views (hiding individual requester/reviewer identities).

- **⚡ Approval Queue & Working Orders**:
  - Executive Board and Core Member governance workflows for reviewing, approving, rejecting, or cancelling trade requests.
  - Clean table formatting with single-line multi-line text wrapping for trade rationales.

- **🌐 Dedicated Public Portal**:
  - Dedicated public namespaces (`/public/dashboard` and `/public/trades`) allowing visitors to browse team rankings, active portfolios, and transparent trade logs without requiring login.
  - Single-line responsive view switcher pill (`🌐 Public View` / `💻 My Terminal`).

- **👤 Interactive User Profile Menu**:
  - Zerodha-style avatar dropdown menu displaying user full name, email address, team badge, role tag, terminal shortcut, notifications badge, and explicit logout trigger.

---

## 🛠️ Technology Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router DOM v6
- **Database & Auth**: Supabase JS Client (`@supabase/supabase-js`)
- **Charts & Data Visualization**: Recharts
- **Styling**: Vanilla CSS Design Tokens (Custom Design System with Inter / IBM Plex Mono typography, HSL color tokens, glassmorphism, responsive media queries)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm or yarn

### Installation

1. Clone the repository and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `frontend/` directory with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### Running Locally

To start the Vite development server with local network exposure (`0.0.0.0`):
```bash
npm run dev
```
The application will be accessible at:
- Local: `http://localhost:5173/`
- Network: `http://<your-lan-ip>:5173/`

### Building for Production

To test and compile the production bundle:
```bash
npm run build
```

To preview the built production bundle locally:
```bash
npm run preview
```

---

## 📁 Directory Structure

```
frontend/
├── public/                # Static public assets and favicon
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ProtectedRoute.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── TickerSearch.jsx
│   │   ├── TopNav.jsx
│   │   └── TradeDetailsModal.jsx
│   ├── lib/               # Utilities, Supabase client, & API helpers
│   │   ├── api.js
│   │   ├── auth.jsx
│   │   ├── format.js
│   │   └── supabase.js
│   ├── pages/             # Application route views
│   │   ├── Login.jsx
│   │   ├── MemberDashboard.jsx
│   │   ├── PublicDashboard.jsx
│   │   ├── PublicTrades.jsx
│   │   └── StockDetail.jsx
│   ├── App.jsx            # Main App component & route declarations
│   ├── main.jsx           # React entry point
│   └── index.css          # Design system & global styles
├── index.html             # HTML entry template
├── package.json           # Dependencies and scripts
└── vite.config.js         # Vite configuration
```

---

## 🔒 Routes Overview

| Path | Access Level | Description |
| :--- | :--- | :--- |
| `/login` | Public | User authentication login page |
| `/public/dashboard` | Public | Public team rankings & leaderboard |
| `/public/trades` | Public | Public transparent trade log |
| `/dashboard` | Protected | Personal team terminal & portfolio management |
| `/stock/:ticker` | Protected | Stock detail, live chart, & order placement form |
