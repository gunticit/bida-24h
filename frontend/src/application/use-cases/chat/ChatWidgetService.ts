export interface ChatWidgetService {
  shouldShowChat(pathname: string, isAuthenticated: boolean, enabled: boolean): boolean;
  getExcludedPages(): string[];
}

export class ChatWidgetServiceImpl implements ChatWidgetService {
  private readonly excludedPages = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
  ];

  shouldShowChat(pathname: string, isAuthenticated: boolean, enabled: boolean): boolean {
    return enabled && 
           !this.excludedPages.some(page => pathname.startsWith(page)) && 
           isAuthenticated;
  }

  getExcludedPages(): string[] {
    return [...this.excludedPages];
  }
}