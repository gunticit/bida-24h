// Auth DTOs
export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

// User DTOs
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserDTO {
  id: number;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export interface UserResponseDTO {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

// Table DTOs
export interface CreateTableDTO {
  name: string;
  pricePerHour: number;
}

export interface UpdateTableDTO {
  id: number;
  name?: string;
  pricePerHour?: number;
  status?: string;
}

export interface TableResponseDTO {
  id: number;
  name: string;
  status: string;
  price_per_hour: number;
  created_at: string;
  updated_at: string;
}

// Session DTOs
export interface StartSessionDTO {
  tableId: number;
  hourPrice: number;
  startTime?: string;
}

export interface EndSessionDTO {
  sessionId: number;
  endTime?: string;
}

export interface SessionResponseDTO {
  id: number;
  table_id: number;
  start_time: string;
  end_time?: string;
  total_time?: number;
  hour_price: number;
  total_money_table: number;
  total_money_food: number;
  total_money: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Report DTOs
export interface PlaytimeReportDTO {
  startDate: string;
  endDate: string;
  tableId?: number;
}

export interface PlaytimeReportResponseDTO {
  sessions: SessionResponseDTO[];
  summary: {
    totalSessions: number;
    totalRevenue: number;
    totalPlaytime: number;
    averageSessionDuration: number;
  };
}