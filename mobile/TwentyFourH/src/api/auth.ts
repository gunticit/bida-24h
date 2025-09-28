import { api } from './client';

export type LoginRequest = { email: string; password: string };
export type RegisterRequest = { name: string; email: string; password: string; password_confirmation?: string };

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  // extend as backend returns
};

export async function login(payload: LoginRequest): Promise<{ token: string; user: AuthUser }> {
  const { data } = await api.post('/auth/login', payload);
  // Expecting { token, user }
  return data;
}

export async function register(payload: RegisterRequest): Promise<{ token: string; user: AuthUser }> {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await api.get('/auth/user');
  return data;
}


