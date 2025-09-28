import { api } from './client';

export type Expense = {
  id: number;
  title: string;
  amount: number;
  note?: string;
  created_at?: string;
};

export async function list(params?: any) {
  const { data } = await api.get('/expenses', { params });
  return Array.isArray(data) ? data : (data.data as Expense[]);
}

export async function create(payload: Pick<Expense, 'title' | 'amount' | 'note'>) {
  const { data } = await api.post('/expenses', payload);
  return data as Expense;
}

export async function update(id: number, payload: Partial<Pick<Expense, 'title' | 'amount' | 'note'>>) {
  const { data } = await api.put(`/expenses/${id}`, payload);
  return data as Expense;
}

export async function remove(id: number) {
  await api.delete(`/expenses/${id}`);
}

export async function summary(params?: { from?: string; to?: string }) {
  const { data } = await api.get('/expenses-summary', { params });
  return data;
}


