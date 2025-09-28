import { api } from './client';

export async function daily(params?: { date?: string }) {
  const { data } = await api.get('/revenue/daily', { params });
  return data;
}

export async function monthly(params?: { month?: string }) {
  const { data } = await api.get('/revenue/monthly', { params });
  return data;
}

export async function yearly(params?: { year?: string }) {
  const { data } = await api.get('/revenue/yearly', { params });
  return data;
}

export async function topTables(params?: { limit?: number }) {
  const { data } = await api.get('/revenue/top-tables', { params });
  return data as Array<{ table_id: number; total: number }>;
}

export async function chart(params?: { from?: string; to?: string; interval?: 'day'|'month'|'year' }) {
  const { data } = await api.get('/revenue/chart', { params });
  return data as Array<{ label: string; value: number }>;
}


