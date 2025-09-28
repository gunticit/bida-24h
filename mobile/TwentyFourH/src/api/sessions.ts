import { api } from './client';

export type Session = {
  id: number;
  table_id?: number | null;
  status?: string;
  started_at?: string;
  ended_at?: string | null;
};

export type SessionOrder = {
  id: number;
  session_id: number;
  menu_id: number;
  quantity: number;
};

export async function today() {
  const { data } = await api.get('/sessions/today');
  return data as Session[];
}

export async function todayOrPlaying() {
  const { data } = await api.get('/sessions/today-or-playing');
  return data as Session[];
}

export async function playingOrLast7Days() {
  const { data } = await api.get('/sessions/playing-or-last7days');
  return data as Session[];
}

export async function addOrder(sessionId: number, payload: { menu_id: number; quantity: number }) {
  const { data } = await api.post(`/sessions/${sessionId}/orders`, payload);
  return data as SessionOrder;
}

export async function removeOrder(orderId: number) {
  await api.delete(`/orders/${orderId}`);
}

export async function updateOrderQuantity(orderId: number, quantity: number) {
  const { data } = await api.put(`/orders/${orderId}/quantity`, { quantity });
  return data as SessionOrder;
}

export async function create(payload: { table_id: number }) {
  const { data } = await api.post('/sessions', payload);
  return data as Session;
}

export async function update(id: number, payload: Partial<Session>) {
  const { data } = await api.put(`/sessions/${id}`, payload);
  return data as Session;
}


