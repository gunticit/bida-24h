// User interfaces
export interface User {
  id: number
  name: string
  email: string
  role?: 'admin' | 'staff'
  created_at: string
  updated_at: string
  [key: string]: unknown // Add index signature for compatibility
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
  unit_price: number
  total_price: number
  created_at: string
  updated_at: string
  menu?: MenuItem
}

export interface CreateOrderData {
  session_id: number | null
  menu_id: number
  quantity: number
  unit_price: number
  total_price: number
}

export interface CreateOrderResponse {
  order: Order
  message: string
  remaining_quantity: number
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
  customer_name?: string
  customer_phone?: string
  notes?: string
  items: {
    menu_id: number
    quantity: number
  }[]
  status?: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
}

// Takeaway Report interfaces
export interface TakeawayReportItem {
  menu_name: string
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
  total_sessions: number
  total_revenue: number
  total_table_revenue: number
  total_food_revenue: number
  total_play_time: number // in minutes
  table_stats: PlaytimeTableStats[]
  food_stats: PlaytimeFoodStats[]
  summary: {
    avg_session_duration: number // in minutes
    avg_revenue_per_session: number
    total_play_hours: number
    total_food_items_sold: number
  }
}

// Expense interfaces
export interface Expense {
  id: number
  expense_date: string
  amount: number
  description: string
  category: string
  user: {
    id: number
    name: string
  }
  created_at: string
}

export interface ExpenseSummary {
  total: number
  today: number
  this_month: number
  this_year: number
  by_category: { [key: string]: number }
}

export interface CreateExpenseData {
  expense_date: string
  amount: number
  description: string
  category: string
}

export interface UpdateExpenseData {
  expense_date: string
  amount: number
  description: string
  category: string
}

export interface ExpenseListResponse {
  data: Expense[]
  current_page: number
  last_page: number
  total: number
}

// Revenue interfaces
export interface RevenueBreakdownItem {
  date: string
  total_revenue: number
  table_revenue: number
  food_revenue: number
  takeaway_revenue: number
  total_expenses: number
  profit: number
  session_count: number
}

export interface MonthlyRevenueBreakdownItem {
  year: number
  month: number
  month_name: string
  total_revenue: number
  table_revenue: number
  food_revenue: number
  takeaway_revenue: number
  total_expenses: number
  profit: number
  session_count: number
}

export interface DailyRevenueResponse {
  total_revenue: number
  table_revenue: number
  food_revenue: number
  takeaway_revenue: number
  total_expenses: number
  profit: number
  session_count: number
  date: string
  sessions: GameSession[]
}

export interface MonthlyRevenueResponse {
  total_revenue: number
  table_revenue: number
  food_revenue: number
  takeaway_revenue: number
  total_expenses: number
  profit: number
  session_count: number
  year: number
  month: number
  month_name: string
  daily_breakdown: RevenueBreakdownItem[]
}

export interface YearlyRevenueResponse {
  total_revenue: number
  table_revenue: number
  food_revenue: number
  takeaway_revenue: number
  total_expenses: number
  profit: number
  session_count: number
  year: number
  monthly_breakdown: MonthlyRevenueBreakdownItem[]
}

// New Revenue System Interfaces
export interface RevenueData {
  revenue: number
  cost_of_goods_sold: number
  expenses: number
  profit: number
  profit_margin: number
}

export interface DailyRevenueData {
  date: string
  revenue: number
  cost_of_goods_sold: number
  expenses: number
  profit: number
  profit_margin: number
}

export interface DailyRevenueReport {
  period: {
    start_date: string
    end_date: string
  }
  daily_data: DailyRevenueData[]
  summary: {
    total_revenue: number
    total_cost_of_goods_sold: number
    total_expenses: number
    total_profit: number
  }
}

export interface CostBreakdownItem {
  product_name: string
  category: string
  total_quantity: number
  total_cost: number
  avg_cost_per_unit: number
}

export interface CostBreakdownResponse {
  period: {
    start_date?: string
    end_date?: string
  }
  order_costs: CostBreakdownItem[]
  takeaway_costs: CostBreakdownItem[]
  total_order_cost: number
  total_takeaway_cost: number
  grand_total: number
}

// API Response interfaces
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export interface MessageResponse {
  message: string
}

export interface FoodData {
  menu_id: number
  quantity: number
}

// Category types
export type MenuCategory = 'food' | 'drink' | 'tobacco' | 'takeaway'
export type TableStatus = 'available' | 'playing' | 'maintenance'
export type SessionStatus = 'playing' | 'finished' | 'canceled'
export type TakeawayStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
export type UserRole = 'admin' | 'staff'
export type ExpenseCategory =
  | 'food'
  | 'utilities'
  | 'rent'
  | 'staff'
  | 'equipment'
  | 'marketing'
  | 'maintenance'
  | 'other'

// Utility types
export type CreateData<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>
export type UpdateData<T> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>
