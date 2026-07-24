// Client for /api/admin/*. The password is held in sessionStorage and sent as a header
// on every request — it is re-checked server-side each time, so there is no session to
// forge. Closing the tab clears it.

const KEY = 'lb_admin_pw'

export function getPassword(): string {
  return sessionStorage.getItem(KEY) ?? ''
}

export function setPassword(pw: string) {
  sessionStorage.setItem(KEY, pw)
}

export function clearPassword() {
  sessionStorage.removeItem(KEY)
}

export class AuthError extends Error {}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': getPassword(),
      ...(init?.headers ?? {}),
    },
  })

  if (res.status === 401) {
    // Kick the UI back to the password screen rather than showing an empty dashboard.
    clearPassword()
    throw new AuthError('Not authorized.')
  }

  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((json as { error?: string }).error || 'Something went wrong.')
  return json as T
}

export type OrderStatus = 'new' | 'confirmed' | 'paid' | 'delivered' | 'cancelled'

export type Order = {
  id: string
  created_at: string
  status: OrderStatus
  arrangements: string[]
  estimated_total: number | null
  card_message: string | null
  custom_details: string | null
  delivery_instructions: string | null
  customer_id: string | null
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  recipient_name: string | null
  recipient_address: string | null
}

export type CustomerSummary = {
  id: string
  created_at: string
  name: string
  email: string
  phone: string | null
  notes: string | null
  recipientCount: number
  orderCount: number
  totalValue: number
}

export type Recipient = {
  id: string
  customer_id: string
  name: string
  address: string
  gate_code: string | null
  delivery_notes: string | null
  relationship: string | null
}

export type Stats = {
  orderCount: number
  customerCount: number
  newOrderCount: number
  lifetimeValue: number
  recentOrders: Order[]
}

export async function login(pw: string): Promise<void> {
  setPassword(pw)
  try {
    await call('/api/admin/login', { method: 'POST', body: '{}' })
  } catch (err) {
    clearPassword()
    throw err
  }
}

export const getStats = () => call<Stats>('/api/admin/stats')

export const getCustomers = (q = '') =>
  call<{ customers: CustomerSummary[] }>(`/api/admin/customers?q=${encodeURIComponent(q)}`)

export const getCustomer = (id: string) =>
  call<{ customer: CustomerSummary; recipients: Recipient[]; orders: Order[] }>(
    `/api/admin/customer?id=${encodeURIComponent(id)}`
  )

export const getOrders = (status = '', sort: 'newest' | 'oldest' = 'newest') =>
  call<{ orders: Order[] }>(
    `/api/admin/orders?status=${encodeURIComponent(status)}&sort=${sort}`
  )

export const setOrderStatus = (id: string, status: OrderStatus) =>
  call<{ ok: true }>('/api/admin/orders', {
    method: 'PATCH',
    body: JSON.stringify({ id, status }),
  })

export const updateOrder = (
  id: string,
  patch: Partial<Pick<Order, 'card_message' | 'delivery_instructions'>> & {
    admin_notes?: string
  }
) =>
  call<{ ok: true }>('/api/admin/orders', {
    method: 'PATCH',
    body: JSON.stringify({ id, ...patch }),
  })

export const deleteOrder = (id: string) =>
  call<{ ok: true }>('/api/admin/orders', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  })

export const updateRecipient = (id: string, patch: Partial<Recipient>) =>
  call<{ ok: true }>('/api/admin/recipient', {
    method: 'PATCH',
    body: JSON.stringify({ id, ...patch }),
  })

// ---------------------------------------------------------------- events roll-up

export type EventRow = {
  id: string
  name: string
  event_date: string | null
  type: string | null
  status: string
  manual_orders: number
  manual_revenue: number
  expense_vases: number
  expense_flowers: number
  expense_misc: number
  expense_detail: string | null
  notes: string | null
  // computed server-side
  autoOrders: number
  autoRevenue: number
  orders: number
  revenue: number
  expenses: number
  profit: number
  margin: number | null
  avgPerOrder: number | null
}

export type EventTotals = {
  orders: number
  revenue: number
  expenses: number
  profit: number
  vases: number
  flowers: number
  misc: number
}

export const getEvents = () =>
  call<{ events: EventRow[]; totals: EventTotals }>('/api/admin/events')

export const createEvent = (patch: Partial<EventRow>) =>
  call<{ ok: true; id: string }>('/api/admin/events', {
    method: 'POST',
    body: JSON.stringify(patch),
  })

export const updateEvent = (id: string, patch: Partial<EventRow>) =>
  call<{ ok: true }>('/api/admin/events', {
    method: 'PATCH',
    body: JSON.stringify({ id, ...patch }),
  })

export const deleteEvent = (id: string) =>
  call<{ ok: true }>('/api/admin/events', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  })
