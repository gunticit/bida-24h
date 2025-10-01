// Bridge for backward compatibility with legacy apiService
import { AuthStateUseCase } from '../../application/use-cases/auth/AuthStateUseCase';

export class LegacyApiServiceBridge {
  private authStateUseCase = AuthStateUseCase.getInstance();

  // Backward compatibility method
  getToken(): string | null {
    return this.authStateUseCase.getToken();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.authStateUseCase.checkAuthenticationStatus().isAuthenticated;
  }

  // Get current user
  getCurrentUser() {
    return this.authStateUseCase.getAuthState().user;
  }
}

// Export singleton instance for backward compatibility
export const legacyApiService = new LegacyApiServiceBridge();