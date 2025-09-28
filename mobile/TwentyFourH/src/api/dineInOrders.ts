import { api } from './client';

export type DineInOrder = {
  id: number;
  table_id?: number;
  total?: number;
  status?: string;
  created_at?: string;
};

export async function list(params?: any) {
  const { data } = await api.get('/dine-in-orders', { params });
  return data as DineInOrder[] | { data: DineInOrder[] };
}

export async function todayOrders() {
  const { data } = await api.get('/dine-in-orders/today');
  return data as DineInOrder[];
}

export async function report(params?: { from?: string; to?: string }) {
  const { data } = await api.get('/dine-in-orders/report', { params });
  return data;
}

export function reportDownloadUrl(params?: { from?: string; to?: string }) {
  const sp = new URLSearchParams(params as any).toString();
  return `/dine-in-orders/report/download${sp ? `?${sp}` : ''}`;
}


