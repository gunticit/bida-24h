import { AuthRepositoryInterface } from '../../ports/repositories';

export class LogoutUseCase {
  constructor(private authRepository: AuthRepositoryInterface) {}

  async execute(): Promise<void> {
    try {
      await this.authRepository.logout();
    } catch (error) {
      // Continue with local cleanup even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }
}