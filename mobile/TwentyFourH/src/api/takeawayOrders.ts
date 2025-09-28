import { api } from './client';

export type TakeawayOrder = {
  id: number;
  customer_name?: string;
  total?: number;
  status?: string;
  created_at?: string;
};

export async function list(params?: any) {
  const { data } = await api.get('/takeaway-orders', { params });
  return data as TakeawayOrder[] | { data: TakeawayOrder[] };
}

export async function todayOrders() {
  const { data } = await api.get('/takeaway-orders/today');
  return data as TakeawayOrder[];
}

export async function report(params?: { from?: string; to?: string }) {
  const { data } = await api.get('/takeaway-orders/report', { params });
  return data;
}

export function reportDownloadUrl(params?: { from?: string; to?: string }) {
  const sp = new URLSearchParams(params as any).toString();
  return `/takeaway-orders/report/download${sp ? `?${sp}` : ''}`;
}


