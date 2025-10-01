import { User, Table, GameSession } from '../../domain/entities';
import {
  LoginDTO,
  LoginResponseDTO,
  CreateUserDTO,
  UpdateUserDTO,
  UserResponseDTO,
  CreateTableDTO,
  UpdateTableDTO,
  StartSessionDTO,
  EndSessionDTO,
  PlaytimeReportDTO,
  PlaytimeReportResponseDTO,
} from '../dto';

export interface AuthRepositoryInterface {
  login(credentials: LoginDTO): Promise<LoginResponseDTO>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<UserResponseDTO | null>;
  refreshToken(): Promise<string>;
}

export interface UserRepositoryInterface {
  findById(id: number): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(data: CreateUserDTO): Promise<User>;
  update(data: UpdateUserDTO): Promise<User>;
  delete(id: number): Promise<void>;
}

export interface TableRepositoryInterface {
  findById(id: number): Promise<Table | null>;
  findAll(): Promise<Table[]>;
  findAvailable(): Promise<Table[]>;
  findPlaying(): Promise<Table[]>;
  create(data: CreateTableDTO): Promise<Table>;
  update(data: UpdateTableDTO): Promise<Table>;
  delete(id: number): Promise<void>;
}

export interface SessionRepositoryInterface {
  findById(id: number): Promise<GameSession | null>;
  findAll(): Promise<GameSession[]>;
  findByTableId(tableId: number): Promise<GameSession[]>;
  findActiveSessionByTableId(tableId: number): Promise<GameSession | null>;
  startSession(data: StartSessionDTO): Promise<GameSession>;
  endSession(data: EndSessionDTO): Promise<GameSession>;
  getPlaytimeReport(data: PlaytimeReportDTO): Promise<PlaytimeReportResponseDTO>;
}