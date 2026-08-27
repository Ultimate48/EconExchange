import { supabase } from './supabase'

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1'

async function invoke(name, { method = 'POST', body = null, query = null } = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const headers = {
    'Content-Type': 'application/json',
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  let url = `${FUNCTIONS_URL}/${name}`
  if (query) {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([k, v]) => {
      if (v != null && v !== '') params.set(k, v)
    })
    const qs = params.toString()
    if (qs) url += `?${qs}`
  }

  const opts = { method, headers }
  if (body && method !== 'GET') {
    opts.body = JSON.stringify(body)
  }

  const res = await fetch(url, opts)
  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error || `Request failed (${res.status})`)
  }
  return json
}

// ── Public endpoints ──────────────────────────────────────────
export function publicPortfolio() {
  return invoke('public-portfolio', { method: 'GET' })
}

export function publicTrades({ team_id, ticker, cursor, limit } = {}) {
  return invoke('public-trades', { method: 'GET', query: { team_id, ticker, cursor, limit } })
}

// ── Auth ──────────────────────────────────────────────────────
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ── Authenticated endpoints ──────────────────────────────────
export function getDashboard() {
  return invoke('get-dashboard', { method: 'GET' })
}

export function getTickerPrice(ticker) {
  return invoke('get-ticker-price', { method: 'GET', query: { ticker } })
}

export function createTrade(body) {
  return invoke('create-trade', { method: 'POST', body })
}

export function approveTrade(trade_id) {
  return invoke('approve-trade', { method: 'POST', body: { trade_id } })
}

export function rejectTrade(trade_id) {
  return invoke('reject-trade', { method: 'POST', body: { trade_id } })
}

export function cancelTrade(trade_id) {
  return invoke('cancel-trade', { method: 'POST', body: { trade_id } })
}

export function getNotifications({ limit, cursor } = {}) {
  return invoke('get-notifications', { method: 'GET', query: { limit, cursor } })
}

export function markNotificationRead(notification_id) {
  return invoke('mark-notifications-read', { method: 'POST', body: { notification_id } })
}
