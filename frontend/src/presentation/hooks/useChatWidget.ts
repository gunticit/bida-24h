'use client'

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChatWidgetUseCase, ChatWidgetConfig } from '../../application/use-cases/chat/ChatWidgetUseCase';
import { AuthStateUseCase } from '../../application/use-cases/auth/AuthStateUseCase';
import { ChatWidgetServiceImpl } from '../../application/use-cases/chat/ChatWidgetService';

interface UseChatWidgetProps {
  enabled?: boolean;
  webhookUrl?: string;
  targetElementId?: string;
}

export function useChatWidget({
  enabled = true,
  webhookUrl = 'https://vface.id.vn/webhook/85a70869-78e4-452a-9779-d151bf283c1a/chat',
  targetElementId = 'global-n8n-chat'
}: UseChatWidgetProps = {}) {
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use cases
  const chatWidgetUseCase = ChatWidgetUseCase.getInstance();
  const authStateUseCase = AuthStateUseCase.getInstance();
  const chatWidgetService = new ChatWidgetServiceImpl();

  // Get authentication status
  const authState = authStateUseCase.checkAuthenticationStatus();

  // Determine if chat should be shown
  const shouldShowChat = chatWidgetService.shouldShowChat(
    pathname,
    authState.isAuthenticated,
    enabled
  );

  // Initialize chat widget
  useEffect(() => {
    if (!shouldShowChat) {
      return;
    }

    let mounted = true;

    const initializeChat = async () => {
      try {
        setError(null);
        
        const config: ChatWidgetConfig = {
          webhookUrl,
          targetElementId,
          metadata: {
            page: pathname,
            timestamp: new Date().toISOString(),
            userId: authState.user?.id,
            userRole: authState.user?.role,
          },
          enabled: true,
        };

        // Wait a bit for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        if (mounted) {
          await chatWidgetUseCase.initializeChat(config);
          setIsInitialized(true);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize chat');
          setIsInitialized(false);
        }
      }
    };

    initializeChat();

    return () => {
      mounted = false;
    };
  }, [shouldShowChat, pathname, authState.isAuthenticated, authState.user?.id, authState.user?.role, webhookUrl, targetElementId, chatWidgetUseCase]);

  // Cleanup on unmount or when conditions change
  useEffect(() => {
    return () => {
      if (isInitialized) {
        chatWidgetUseCase.cleanup().catch(console.error);
        setIsInitialized(false);
      }
    };
  }, [shouldShowChat, chatWidgetUseCase, isInitialized]);

  // Reset state when page or auth changes
  useEffect(() => {
    setIsInitialized(false);
    setError(null);
  }, [pathname, authState.isAuthenticated]);

  return {
    shouldShowChat,
    isInitialized,
    error,
    authState,
    retry: () => {
      setError(null);
      setIsInitialized(false);
    }
  };
}