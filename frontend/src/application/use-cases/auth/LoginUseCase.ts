import { AuthRepositoryInterface } from '../../ports/repositories';
import { LoginDTO, LoginResponseDTO } from '../../dto';

export class LoginUseCase {
  constructor(private authRepository: AuthRepositoryInterface) {}

  async execute(credentials: LoginDTO): Promise<LoginResponseDTO> {
    // Validate input
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      throw new Error('Invalid email format');
    }

    try {
      const result = await this.authRepository.login(credentials);
      
      // Store token in localStorage
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      return result;
    } catch (error) {
      throw new Error('Login failed: Invalid credentials');
    }
  }
}