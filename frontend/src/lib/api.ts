const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL
  : 'http://localhost:8000/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: 'admin' | 'staff';
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'admin' | 'staff';
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface Session {
  id: number;
  table_id: number;
  start_time: string;
  end_time: string | null;
  total_time: number | null;
  hour_price: number;
  total_money_table: number | null;
  total_money_food: number | null;
  total_money: number | null;
  status: 'playing' | 'finished' | 'canceled';
  table?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Table {
  id: number;
  name: string;
  status: 'available' | 'playing' | 'maintenance';
  price_per_hour: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: 'food' | 'drink';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  session_id: number;
  menu_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
  menu?: MenuItem;
}

export interface CreateOrderData {
  session_id: number;
  menu_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CreateSessionData {
  table_id: number;
  start_time: string;
  hour_price: number;
  status?: 'playing' | 'finished' | 'canceled';
}

export interface UpdateSessionData {
  table_id?: number;
  start_time?: string;
  end_time?: string;
  hour_price?: number;
  status?: 'playing' | 'finished' | 'canceled';
  total_money_table?: number;
  total_money_food?: number;
  total_money?: number;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/user');
  }

  // User management methods
  async getUsers(): Promise<{ data: User[]; meta: any }> {
    return this.request<{ data: User[]; meta: any }>('/users');
  }

  async getUser(id: number): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async createUser(data: Omit<RegisterData, 'password_confirmation'>): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Session management methods
  async getSessions(): Promise<Session[]> {
    return this.request<Session[]>('/sessions');
  }

  async getSession(id: number): Promise<Session> {
    return this.request<Session>(`/sessions/${id}`);
  }

  async createSession(data: CreateSessionData): Promise<Session> {
    return this.request<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSession(id: number, data: UpdateSessionData): Promise<Session> {
    return this.request<Session>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSession(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  // Table management methods
  async getTables(): Promise<Table[]> {
    return this.request<Table[]>('/tables');
  }

  async getTable(id: number): Promise<Table> {
    return this.request<Table>(`/tables/${id}`);
  }

  async createTable(data: Omit<Table, 'id' | 'created_at' | 'updated_at'>): Promise<Table> {
    return this.request<Table>('/tables', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTable(id: number, data: Partial<Omit<Table, 'id' | 'created_at' | 'updated_at'>>): Promise<Table> {
    return this.request<Table>(`/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTable(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tables/${id}`, {
      method: 'DELETE',
    });
  }

  // Menu management methods
  async getMenus(): Promise<MenuItem[]> {
    return this.request<MenuItem[]>('/menus');
  }

  async getMenu(id: number): Promise<MenuItem> {
    return this.request<MenuItem>(`/menus/${id}`);
  }

  async createMenu(data: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> {
    return this.request<MenuItem>('/menus', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMenu(id: number, data: Partial<Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>>): Promise<MenuItem> {
    return this.request<MenuItem>(`/menus/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMenu(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/menus/${id}`, {
      method: 'DELETE',
    });
  }

  // Order management methods
  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders');
  }

  async getOrder(id: number): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  async createOrder(data: CreateOrderData): Promise<Order> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrder(id: number, data: Partial<CreateOrderData>): Promise<Order> {
    return this.request<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOrder(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/orders/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
