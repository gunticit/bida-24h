import type {
  User,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  AuthResponse,
  GameSession,
  CreateSessionData,
  UpdateSessionData,
  Table,
  MenuItem,
  Order,
  CreateOrderData,
  CreateOrderResponse,
  TakeawayOrder,
  CreateTakeawayOrderData,
  TakeawayReportData,
  PlaytimeReportData,
  Expense,
  ExpenseSummary,
  CreateExpenseData,
  UpdateExpenseData,
  ExpenseListResponse,
  DailyRevenueReport,
  MonthlyRevenueResponse,
  YearlyRevenueResponse,
  CostBreakdownResponse,
  MessageResponse,
  DownloadResponse,
} from '@/types/api'

const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_API_URL || 'https://thanhtoan.24hbilliardscoffee.com/api'
    : 'http://localhost:8001/api'

class ApiService {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
    }
    return this.token
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }

  private async downloadFromUrl(url: string, filename: string): Promise<void> {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  private async generateAndDownloadReport(
    endpoint: string, 
    fromDate: string, 
    toDate: string, 
    reportType: string
  ): Promise<void> {
    try {
      console.log(`Generating ${reportType} report from:`, fromDate, 'to:', toDate)

      // Call API to generate file and get download link
      const response = await this.request<DownloadResponse>(
        `${endpoint}/generate?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}`,
        {
          method: 'POST',
        }
      )

      console.log('Received download URL:', response.download_url)

      // Create filename with timestamp to avoid conflicts
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const filename = `${reportType}-report-${fromDate}-${toDate}-${timestamp}.xlsx`
      
      await this.downloadFromUrl(response.download_url, filename)
      
      console.log(`${reportType} report download completed successfully`)
    } catch (error) {
      console.error(`${reportType} report download failed:`, error)
      throw new Error(
        `Tải báo cáo ${reportType} thất bại: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`
      )
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const token = this.getToken()

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async logout(): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    })
    this.clearToken()
    return response
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/user')
  }

  async updateProfile(data: UpdateProfileData): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // User management methods
  async getUsers(): Promise<{ data: User[]; meta: unknown }> {
    return this.request<{ data: User[]; meta: unknown }>('/users')
  }

  async getUser(id: number): Promise<User> {
    return this.request<User>(`/users/${id}`)
  }

  async createUser(data: Omit<RegisterData, 'password_confirmation'>): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    })
  }

  // Session management methods
  async getSessions(): Promise<GameSession[]> {
    return this.request<GameSession[]>('/sessions')
  }

  async getSessionsTodayOrPlaying(): Promise<GameSession[]> {
    return this.request<GameSession[]>('/sessions/today-or-playing')
  }

  async getSessionsPlayingOrLast7Days(): Promise<GameSession[]> {
    return this.request<GameSession[]>('/sessions/playing-or-last7days')
  }

  async getSessionsToday(): Promise<GameSession[]> {
    return this.request<GameSession[]>('/sessions/today')
  }

  async getSession(id: number): Promise<GameSession> {
    return this.request<GameSession>(`/sessions/${id}`)
  }

  async createSession(data: CreateSessionData): Promise<GameSession> {
    return this.request<GameSession>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateSession(id: number, data: UpdateSessionData): Promise<GameSession> {
    return this.request<GameSession>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteSession(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/sessions/${id}`, {
      method: 'DELETE',
    })
  }

  async addOrderToSession(sessionId: number, menuId: number, quantity: number): Promise<Order> {
    return this.request<Order>(`/sessions/${sessionId}/orders`, {
      method: 'POST',
      body: JSON.stringify({ menu_id: menuId, quantity }),
    })
  }

  async removeOrderFromSession(orderId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/orders/${orderId}`, {
      method: 'DELETE',
    })
  }

  async updateOrderQuantity(orderId: number, quantity: number): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}/quantity`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    })
  }

  // Table management methods
  async getTables(): Promise<Table[]> {
    return this.request<Table[]>('/tables')
  }

  async getTable(id: number): Promise<Table> {
    return this.request<Table>(`/tables/${id}`)
  }

  async createTable(data: Omit<Table, 'id' | 'created_at' | 'updated_at'>): Promise<Table> {
    return this.request<Table>('/tables', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTable(
    id: number,
    data: Partial<Omit<Table, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<Table> {
    return this.request<Table>(`/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTable(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tables/${id}`, {
      method: 'DELETE',
    })
  }

  // Menu management methods
  async getMenus(): Promise<MenuItem[]> {
    return this.request<MenuItem[]>('/menus')
  }

  async getAvailableMenus(): Promise<MenuItem[]> {
    return this.request<MenuItem[]>('/menus/available')
  }

  async getDineInMenus(): Promise<MenuItem[]> {
    const menus = await this.getAvailableMenus()
    return menus.filter((menu) => menu.category !== 'takeaway')
  }

  async getMenu(id: number): Promise<MenuItem> {
    return this.request<MenuItem>(`/menus/${id}`)
  }

  async createMenu(data: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> {
    return this.request<MenuItem>('/menus', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateMenu(
    id: number,
    data: Partial<Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<MenuItem> {
    return this.request<MenuItem>(`/menus/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteMenu(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/menus/${id}`, {
      method: 'DELETE',
    })
  }

  async updateMenuQuantity(id: number, quantity: number): Promise<MenuItem> {
    return this.request<MenuItem>(`/menus/${id}/quantity`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    })
  }

  async decreaseMenuQuantity(id: number, amount: number): Promise<MenuItem> {
    return this.request<MenuItem>(`/menus/${id}/decrease-quantity`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  }

  async increaseMenuQuantity(id: number, amount: number): Promise<MenuItem> {
    return this.request<MenuItem>(`/menus/${id}/increase-quantity`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  }

  // Order management methods
  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders')
  }

  async getOrder(id: number): Promise<Order> {
    return this.request<Order>(`/orders/${id}`)
  }

  async createOrder(data: CreateOrderData): Promise<CreateOrderResponse> {
    return this.request<CreateOrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateOrder(id: number, data: Partial<CreateOrderData>): Promise<Order> {
    return this.request<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteOrder(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/orders/${id}`, {
      method: 'DELETE',
    })
  }

  // Revenue statistics methods (legacy - to be removed)
  async getTopTables(limit?: number, period?: string): Promise<unknown> {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (period) params.append('period', period)
    const queryString = params.toString() ? `?${params.toString()}` : ''
    return this.request<unknown>(`/revenue/top-tables${queryString}`)
  }

  async getRevenueChart(period?: string, type?: string): Promise<unknown> {
    const params = new URLSearchParams()
    if (period) params.append('period', period)
    if (type) params.append('type', type)
    const queryString = params.toString() ? `?${params.toString()}` : ''
    return this.request<unknown>(`/revenue/chart${queryString}`)
  }

  // Takeaway order methods (new system)
  async getTakeawayOrders(): Promise<TakeawayOrder[]> {
    return this.request<TakeawayOrder[]>('/takeaway-orders/')
  }

  async getTodayTakeawayOrders(): Promise<TakeawayOrder[]> {
    return this.request<TakeawayOrder[]>('/takeaway-orders/today')
  }

  async getTakeawayOrder(id: number): Promise<TakeawayOrder> {
    return this.request<TakeawayOrder>(`/takeaway-orders/${id}`)
  }

  async createTakeawayOrder(data: CreateTakeawayOrderData): Promise<TakeawayOrder> {
    return this.request<TakeawayOrder>('/takeaway-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTakeawayOrderStatus(
    id: number,
    status: TakeawayOrder['status'],
  ): Promise<TakeawayOrder> {
    return this.request<TakeawayOrder>(`/takeaway-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  async deleteTakeawayOrder(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/takeaway-orders/${id}`, {
      method: 'DELETE',
    })
  }

  // Takeaway reports
  async getTakeawayReportData(fromDate: string, toDate: string): Promise<TakeawayReportData> {
    return this.request<TakeawayReportData>(
      `/takeaway-orders/report?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}`,
    )
  }

  async downloadTakeawayReport(fromDate: string, toDate: string): Promise<void> {
    return this.generateAndDownloadReport('/takeaway-orders/report', fromDate, toDate, 'takeaway')
  }

  // Dine-in order methods
  async getTodayDineInOrders(): Promise<TakeawayOrder[]> {
    return this.request<TakeawayOrder[]>('/dine-in-orders/today')
  }

  async getDineInOrder(id: number): Promise<TakeawayOrder> {
    return this.request<TakeawayOrder>(`/dine-in-orders/${id}`)
  }

  async createDineInOrder(data: CreateTakeawayOrderData): Promise<TakeawayOrder> {
    return this.request<TakeawayOrder>('/dine-in-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateDineInOrderStatus(
    id: number,
    status: TakeawayOrder['status'],
  ): Promise<TakeawayOrder> {
    return this.request<TakeawayOrder>(`/dine-in-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  async deleteDineInOrder(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/dine-in-orders/${id}`, {
      method: 'DELETE',
    })
  }

  // Dine-in reports
  async getDineInReportData(fromDate: string, toDate: string): Promise<TakeawayReportData> {
    return this.request<TakeawayReportData>(
      `/dine-in-orders/report?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}`,
    )
  }

  async downloadDineInReport(fromDate: string, toDate: string): Promise<void> {
    return this.generateAndDownloadReport('/dine-in-orders/report', fromDate, toDate, 'dine-in')
  }

  // Legacy takeaway methods (will be deprecated)
  async getLegacyTakeawayOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders/takeaway')
  }

  async createLegacyTakeawayOrder(data: {
    menu_id: number
    quantity: number
    unit_price: number
    customer_name?: string
    customer_phone?: string
    notes?: string
  }): Promise<Order> {
    return this.request<Order>('/orders/takeaway', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Expense management methods
  async getExpenses(
    filter: { start_date?: string; end_date?: string; category?: string },
    page: number = 1,
  ): Promise<ExpenseListResponse> {
    const params = new URLSearchParams()
    if (filter.start_date) params.append('start_date', filter.start_date)
    if (filter.end_date) params.append('end_date', filter.end_date)
    if (filter.category) params.append('category', filter.category)
    return this.request<ExpenseListResponse>(`/expenses?page=${page}&${params.toString()}`)
  }

  async getExpenseSummary(start_date: string, end_date: string): Promise<ExpenseSummary> {
    return this.request<ExpenseSummary>(
      '/expenses-summary?start_date=' + start_date + '&end_date=' + end_date,
    )
  }

  async createExpense(data: CreateExpenseData): Promise<Expense> {
    return this.request<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateExpense(id: number, data: UpdateExpenseData): Promise<Expense> {
    return this.request<Expense>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteExpense(id: number): Promise<MessageResponse> {
    return this.request<MessageResponse>(`/expenses/${id}`, {
      method: 'DELETE',
    })
  }

  async getDailyRevenue(startDate?: string, endDate?: string): Promise<DailyRevenueReport> {
    let url = '/revenue/daily'
    const params = []
    if (startDate) params.push(`start_date=${startDate}`)
    if (endDate) params.push(`end_date=${endDate}`)
    if (params.length > 0) {
      url += `?${params.join('&')}`
    }
    return this.request<DailyRevenueReport>(url)
  }

  async getMonthlyRevenue(year?: number, month?: number): Promise<MonthlyRevenueResponse> {
    let url = '/revenue/monthly'
    const params = []
    if (year) params.push(`year=${year}`)
    if (month) params.push(`month=${month}`)
    if (params.length > 0) {
      url += `?${params.join('&')}`
    }
    return this.request<MonthlyRevenueResponse>(url)
  }

  async getYearlyRevenue(year?: number): Promise<YearlyRevenueResponse> {
    let url = '/revenue/yearly'
    const params = []
    if (year) params.push(`year=${year}`)
    if (params.length > 0) {
      url += `?${params.join('&')}`
    }
    return this.request<YearlyRevenueResponse>(url)
  }

  async getCostBreakdown(startDate?: string, endDate?: string): Promise<CostBreakdownResponse> {
    let url = '/revenue/cost-breakdown'
    const params = []
    if (startDate) params.push(`start_date=${startDate}`)
    if (endDate) params.push(`end_date=${endDate}`)
    if (params.length > 0) {
      url += `?${params.join('&')}`
    }
    return this.request<CostBreakdownResponse>(url)
  }

  // Playtime session reports
  async getPlaytimeReportData(fromDate: string, toDate: string): Promise<PlaytimeReportData> {
    return this.request<PlaytimeReportData>(
      `/sessions/report?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}`,
    )
  }

  async downloadPlaytimeReport(fromDate: string, toDate: string): Promise<void> {
    return this.generateAndDownloadReport('/sessions/report', fromDate, toDate, 'playtime')
  }
}

export const apiService = new ApiService()

// Re-export commonly used interfaces for backward compatibility
export type {
  User,
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  AuthResponse,
  GameSession,
  Table,
  MenuItem,
  Order,
  TakeawayOrder,
  CreateTakeawayOrderData,
  Expense,
  ExpenseSummary,
  DailyRevenueResponse,
  MonthlyRevenueResponse,
  YearlyRevenueResponse,
} from '@/types/api'
