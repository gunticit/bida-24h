import { UserRole } from '../../../domain/enums';

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  } | null;
  token: string | null;
}

export class AuthStateUseCase {
  private static instance: AuthStateUseCase;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
  };

  static getInstance(): AuthStateUseCase {
    if (!AuthStateUseCase.instance) {
      AuthStateUseCase.instance = new AuthStateUseCase();
    }
    return AuthStateUseCase.instance;
  }

  checkAuthenticationStatus(): AuthState {
    if (typeof window === 'undefined') {
      return this.authState;
    }

    try {
      // Use the same token key as the old apiService for compatibility
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        this.authState = {
          isAuthenticated: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as UserRole,
          },
          token,
        };
      } else {
        this.authState = {
          isAuthenticated: false,
          user: null,
          token: null,
        };
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      this.authState = {
        isAuthenticated: false,
        user: null,
        token: null,
      };
    }

    return this.authState;
  }

  getAuthState(): AuthState {
    return this.authState;
  }

  updateAuthState(authState: AuthState): void {
    this.authState = authState;
  }

  // Compatibility method to work with existing apiService usage
  getToken(): string | null {
    return this.checkAuthenticationStatus().token;
  }
}