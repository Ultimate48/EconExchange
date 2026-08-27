# Econ Exchange — UI Design Brief

This document is the design contract for building the frontend, along with
the full page inventory.

---

## 1. Design direction

**Reference: Zerodha Kite** (kite.zerodha.com) — its overall colors, UI
patterns, and general design language. Look at how Kite actually looks and
build in that spirit: a real trading terminal, dense and functional, not a
generic AI-generated SaaS dashboard.

Anti-goals — avoid these regardless of how the rest of the UI turns out:
- No boilerplate "AI-template" look (big floating rounded cards on a light
  gradient background, oversized hero sections)
- No gratuitous animation, particle effects, or decorative glow/gradients
- No gamification — no streaks, badges, confetti, celebratory modals
- This is not a product for toddlers — treat the user like a trader at a
  terminal

If a finished screen could be mistaken for a generic AI-template dashboard,
it has failed the brief. If it could pass as a screenshot from a real
trading tool, it has succeeded.

---

## 2. Page inventory

### Public (no login required)

1. **Public dashboard** — every team's cash, holdings, and total portfolio
   value. Data: `public-portfolio`.
2. **Public trade log** — settled trades only, with the reasoning text
   shown alongside each trade. Filterable by team and/or ticker, paginated.
   Data: `public-trades`.

### Authenticated

3. **Login** — email + password.
4. **Member dashboard** (the main screen, shared by all roles):
   - Base content, all roles: own team's cash, current holdings, recent own
     trades, and an equity-curve chart (from `portfolio_snapshots`).
     Data: `get-dashboard`.
   - Extra panels, `core`/`exec_board` only, shown on the same page:
     - **Approval queue** — pending (`requested`) trades for their team,
       with approve/reject actions. Data: `approve-trade`, `reject-trade`.
     - **Working orders** — live `working` limit orders for their team,
       with a cancel action. Data: `cancel-trade`.
5. **Ticker search / stock detail** — search across the tradeable
   whitelist, view current price and price history for a selected ticker,
   and enter a trade from here. Data: `get-ticker-price`.
6. **New trade request** — ticker, side (buy/sell), order type
   (market/limit), quantity, limit price (if applicable), and required
   reasoning text. Data: `create-trade`.
7. **Notifications** — list of the member's own notifications, manual
   refresh button, per-item dismiss. Data: `get-notifications`,
   `mark-notification-read`.

That's 7 pages total (2 public, 5 authenticated), with the approval queue
and working-orders management living as panels inside the dashboard rather
than as their own routes.