import { AuthRepositoryInterface } from '../../application/ports/repositories';
import { LoginDTO, LoginResponseDTO, UserResponseDTO } from '../../application/dto';
import { ApiClient } from './ApiClient';

export class AuthApiRepository implements AuthRepositoryInterface {
  constructor(private apiClient: ApiClient) {}

  async login(credentials: LoginDTO): Promise<LoginResponseDTO> {
    return this.apiClient.post<LoginResponseDTO>('/auth/login', credentials);
  }

  async logout(): Promise<void> {
    await this.apiClient.post<void>('/auth/logout');
  }

  async getCurrentUser(): Promise<UserResponseDTO | null> {
    try {
      return await this.apiClient.get<UserResponseDTO>('/auth/user');
    } catch (error) {
      return null;
    }
  }

  async refreshToken(): Promise<string> {
    const response = await this.apiClient.post<{ token: string }>('/auth/refresh');
    return response.token;
  }
}