// User interfaces
export interface User {
  id: number
  name: string
  email: string
  role?: 'admin' | 'staff'
  created_at: string
  updated_at: string
  [key: string]: unknown
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
  role?: 'admin' | 'staff'
}

export interface UpdateProfileData {
  name?: string
  email?: string
  password?: string
  password_confirmation?: string
  current_password?: string
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

// Game Session interfaces
export interface GameSession {
  id: number
  table_id: number
  start_time: string
  end_time: string
  total_time: number | null
  hour_price: number
  total_money_table: number | null
  total_money_food: number | null
  total_money: number | null
  status: 'playing' | 'finished' | 'canceled'
  table?: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
}

export interface CreateSessionData {
  table_id: number
  start_time: string
  hour_price: number
  status?: 'playing' | 'finished' | 'canceled'
}

export interface UpdateSessionData {
  table_id?: number
  start_time?: string
  end_time?: string
  hour_price?: number
  status?: 'playing' | 'finished' | 'canceled'
  total_money_table?: number
  total_money_food?: number
  total_money?: number
}

// Table interfaces
export interface Table {
  id: number
  name: string
  status: 'available' | 'playing' | 'maintenance'
  price_per_hour: number
  created_at: string
  updated_at: string
}

// Menu interfaces
export interface MenuItem {
  id: number
  name: string
  price: number
  cost_price?: number
  quantity: number
  category: 'food' | 'drink' | 'tobacco' | 'takeaway'
  is_active: boolean
  created_at: string
  updated_at: string
}

// Order interfaces
export interface Order {
  id: number
  session_id: number
  menu_id: number
  quantity: number
  price: number
  total: number
  created_at: string
  updated_at: string
  menu?: MenuItem
}

export interface CreateOrderData {
  menu_id: number
  quantity: number
}

export interface CreateOrderResponse {
  order: Order
  message: string
  remaining_quantity: number
}

// QR Table interfaces
export interface QRTableScanResponse {
  table: {
    id: number
    name: string
    status: 'available' | 'playing' | 'maintenance'
    price_per_hour: number
  }
  is_available: boolean
  active_session?: {
    id: number
    start_time: string
    duration_minutes: number
  }
  user?: {
    id: number
    name: string
    role: string
  }
  can_auto_book?: boolean
  can_request_booking?: boolean
}

export interface AutoBookTableResponse {
  message: string
  session: {
    id: number
    table_id: number
    start_time: string
    hour_price: number
    status: string
  }
  table: {
    id: number
    name: string
    status: string
  }
}

// Booking Request interfaces
export interface BookingRequest {
  id: number
  table_id: number
  table_name?: string
  request_ip: string
  user_agent: string
  status: 'pending' | 'approved' | 'rejected'
  requested_at: string
  handled_at?: string
  handled_by?: number
  admin_notes?: string
}

export interface BookingRequestResponse {
  message: string
  booking_request: {
    id: number
    table_id: number
    table_name: string
    status: 'pending' | 'approved' | 'rejected'
    requested_at: string
  }
}

export interface BookingRequestListResponse {
  data: BookingRequest[]
  meta?: unknown
}

// Notification interfaces
export interface NotificationData {
  id: number
  type: 'booking_request'
  table_id: number
  table_name: string
  message: string
  requested_at: string
  status: 'pending'
}

export interface NotificationListResponse {
  notifications: NotificationData[]
  count: number
}

// Takeaway Order interfaces
export interface TakeawayOrder {
  id: number
  customer_name: string
  customer_phone: string
  notes?: string
  total_amount: number
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  order_date: string
  created_at: string
  updated_at: string
  items: TakeawayOrderItem[]
}

export interface TakeawayOrderItem {
  id: number
  takeaway_order_id: number
  menu_id: number
  quantity: number
  price: number
  total: number
  created_at: string
  updated_at: string
  menu?: MenuItem
}

export interface CreateTakeawayOrderData {
  customer_name: string
  customer_phone: string
  notes?: string
  items: {
    menu_id: number
    quantity: number
  }[]
}

export interface TakeawayReportItem {
  menu_name: string
  category: string
  total_quantity: number
  unit_price: number
  total_amount: number
}

export interface TakeawayReportData {
  from_date: string
  to_date: string
  total_orders: number
  total_amount: number
  items: TakeawayReportItem[]
  summary: {
    total_items_sold: number
    average_order_value: number
  }
}

// Playtime Report interfaces
export interface PlaytimeTableStats {
  table_name: string
  sessions_count: number
  total_revenue: number
  table_revenue: number
  food_revenue: number
  total_hours: number
}

export interface PlaytimeFoodStats {
  menu_name: string
  category: string
  total_quantity: number
  unit_price: number
  total_amount: number
}

export interface PlaytimeReportData {
  from_date: string
  to_date: string
  summary: {
    total_sessions: number
    total_revenue: number
    total_table_revenue: number
    total_food_revenue: number
    total_hours_played: number
    average_session_duration: number
  }
  table_stats: PlaytimeTableStats[]
  food_stats: PlaytimeFoodStats[]
}

// Expense interfaces
export interface Expense {
  id: number
  date: string
  category: string
  description: string
  amount: number
  created_at: string
  updated_at: string
}

export interface CreateExpenseData {
  date: string
  category: string
  description: string
  amount: number
}

export interface UpdateExpenseData {
  date?: string
  category?: string
  description?: string
  amount?: number
}

export interface ExpenseSummary {
  total_expenses: number
  expenses_by_category: Record<string, number>
  recent_expenses: Expense[]
}

export interface ExpenseListResponse {
  data: Expense[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from: number
    to: number
  }
}

// Revenue interfaces
export interface DailyRevenueReport {
  date: string
  revenue: number
  sessions: number
}

export interface MonthlyRevenueResponse {
  month: string
  revenue: number
  sessions: number
  avg_session_value: number
}

export interface YearlyRevenueResponse {
  year: number
  revenue: number
  sessions: number
  months: MonthlyRevenueResponse[]
}

export interface CostBreakdownResponse {
  total_revenue: number
  total_cost: number
  profit: number
  profit_margin: number
  cost_by_category: Record<string, number>
}

// Utility interfaces
export interface MessageResponse {
  message: string
}

export interface DownloadResponse {
  download_url: string
  message: string
}