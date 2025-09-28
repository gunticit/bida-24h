import { api } from './client';

export type Menu = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  is_available?: boolean;
};

export async function list(params?: { page?: number; per_page?: number }) {
  const { data } = await api.get('/menus', { params });
  return data as { data: Menu[]; meta?: any } | Menu[];
}

export async function available() {
  const { data } = await api.get('/menus/available');
  return data as Menu[];
}

export async function updateQuantity(menuId: number, quantity: number) {
  const { data } = await api.put(`/menus/${menuId}/quantity`, { quantity });
  return data as Menu;
}

export async function increaseQuantity(menuId: number, amount = 1) {
  const { data } = await api.post(`/menus/${menuId}/increase-quantity`, { amount });
  return data as Menu;
}

export async function decreaseQuantity(menuId: number, amount = 1) {
  const { data } = await api.post(`/menus/${menuId}/decrease-quantity`, { amount });
  return data as Menu;
}


