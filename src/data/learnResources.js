// src/data/learnResources.js
//
// Add or edit resources here. Each entry needs:
//   title    – display name
//   url      – full URL (YouTube, article, podcast, etc.)
//   type     – 'video' | 'article' | 'podcast' | 'tool'
//   tag      – short category label shown on the card
//   desc     – one-line description
//
// Changes here show up immediately — no backend/DB needed.

export const learnResources = [
  // ── Foundational Videos ───────────────────────────────────────────────────
  {
    title: "Stock Market Basics – Zerodha Varsity",
    url: "https://zerodha.com/varsity/module/introduction-to-stock-markets/",
    type: "article",
    tag: "Basics",
    desc: "India's most comprehensive beginner guide to equity markets by Zerodha.",
  },
  {
    title: "How the Stock Market Works – TED-Ed",
    url: "https://www.youtube.com/watch?v=p7HKvqRI_Bo",
    type: "video",
    tag: "Basics",
    desc: "A crisp 5-minute animated explainer on how equity markets function.",
  },
  {
    title: "What is an IPO? – CNBC Explained",
    url: "https://www.youtube.com/watch?v=o-4SRY9XPG4",
    type: "video",
    tag: "Basics",
    desc: "Understand what happens when a company goes public.",
  },

  // ── Technical Analysis ────────────────────────────────────────────────────
  {
    title: "Technical Analysis – Zerodha Varsity",
    url: "https://zerodha.com/varsity/module/technical-analysis/",
    type: "article",
    tag: "Technical",
    desc: "Candlestick patterns, indicators, and chart-reading from first principles.",
  },
  {
    title: "Candlestick Patterns Explained",
    url: "https://www.youtube.com/watch?v=qj5TMRFv-rk",
    type: "video",
    tag: "Technical",
    desc: "Learn the most common candlestick patterns used by traders worldwide.",
  },
  {
    title: "Moving Averages – How to Use Them",
    url: "https://www.youtube.com/watch?v=FrqSWwlPcTo",
    type: "video",
    tag: "Technical",
    desc: "MA, EMA, and crossover strategies explained with real chart examples.",
  },

  // ── Fundamental Analysis ──────────────────────────────────────────────────
  {
    title: "Fundamental Analysis – Zerodha Varsity",
    url: "https://zerodha.com/varsity/module/fundamental-analysis/",
    type: "article",
    tag: "Fundamental",
    desc: "P/E ratio, EPS, balance sheets, and how to pick stocks the Warren Buffett way.",
  },
  {
    title: "How to Read a Balance Sheet",
    url: "https://www.youtube.com/watch?v=yT7dRNMTBpE",
    type: "video",
    tag: "Fundamental",
    desc: "Step-by-step breakdown of assets, liabilities, and equity.",
  },
  {
    title: "Understanding P/E Ratio",
    url: "https://www.youtube.com/watch?v=Ux0HsBFIXQA",
    type: "video",
    tag: "Fundamental",
    desc: "What price-to-earnings tells you about a company's valuation.",
  },

  // ── Macro & Economy ───────────────────────────────────────────────────────
  {
    title: "How RBI Monetary Policy Affects Markets",
    url: "https://www.youtube.com/watch?v=I_N7xOGFJgY",
    type: "video",
    tag: "Macro",
    desc: "Repo rates, inflation, and the ripple effect on Nifty & Sensex.",
  },
  {
    title: "India Budget & Stock Markets Explained",
    url: "https://www.youtube.com/watch?v=R8Y7aKJNALQ",
    type: "video",
    tag: "Macro",
    desc: "How Union Budget announcements move sector indices.",
  },

  // ── Options & Derivatives ─────────────────────────────────────────────────
  {
    title: "Options Theory for Professional Trading – Varsity",
    url: "https://zerodha.com/varsity/module/option-theory/",
    type: "article",
    tag: "Derivatives",
    desc: "Calls, puts, Greeks, and options strategies in the Indian market context.",
  },
  {
    title: "What are Futures & Options? – Groww",
    url: "https://www.youtube.com/watch?v=CGP6hSRwKTs",
    type: "video",
    tag: "Derivatives",
    desc: "F&O explained simply for beginners — types, pay-offs, and risks.",
  },

  // ── Tools ─────────────────────────────────────────────────────────────────
  {
    title: "Screener.in – Fundamental Stock Screener",
    url: "https://www.screener.in/",
    type: "tool",
    tag: "Tools",
    desc: "India's best free tool for screening stocks by financials and ratios.",
  },
  {
    title: "TradingView – Charts & Technical Analysis",
    url: "https://www.tradingview.com/",
    type: "tool",
    tag: "Tools",
    desc: "Professional-grade charting platform used by traders worldwide.",
  },
  {
    title: "Tickertape – Portfolio & Research",
    url: "https://www.tickertape.in/",
    type: "tool",
    tag: "Tools",
    desc: "Stock analysis, peer comparison, and portfolio tracking for Indian stocks.",
  },
  {
    title: "Moneycontrol – News & Data",
    url: "https://www.moneycontrol.com/",
    type: "tool",
    tag: "Tools",
    desc: "Real-time market news, analyst reports, and corporate earnings data.",
  },

  // ── Books / Deep Dives ────────────────────────────────────────────────────
  {
    title: "The Intelligent Investor – Summary",
    url: "https://www.youtube.com/watch?v=Kf5mGPFp3gI",
    type: "video",
    tag: "Books",
    desc: "Key lessons from Benjamin Graham's timeless classic on value investing.",
  },
  {
    title: "One Up On Wall Street – Key Takeaways",
    url: "https://www.youtube.com/watch?v=8_jMjAIVi2Q",
    type: "video",
    tag: "Books",
    desc: "Peter Lynch's approach to finding winning stocks in everyday life.",
  },
];

// All unique tags derived from resources above — used to populate filter pills
export const allTags = ["All", ...new Set(learnResources.map((r) => r.tag))];
