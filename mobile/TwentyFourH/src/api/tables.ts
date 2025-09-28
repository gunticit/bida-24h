import { api } from './client';

export type Table = {
  id: number;
  name: string;
  status?: string;
  qr_code_url?: string | null;
};

export async function list() {
  const { data } = await api.get('/tables');
  return Array.isArray(data) ? data : (data.data as Table[]);
}

export async function get(id: number) {
  const { data } = await api.get(`/tables/${id}`);
  return data as Table;
}


