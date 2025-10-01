// Chat Widget Use Case
export interface ChatWidgetConfig {
  webhookUrl: string;
  targetElementId: string;
  metadata?: Record<string, unknown>;
  enabled: boolean;
}

interface ChatInstance {
  unmount?: () => Promise<void> | void;
}

export class ChatWidgetUseCase {
  private static instance: ChatWidgetUseCase;
  private chatInstance: ChatInstance | null = null;
  private initialized = false;

  static getInstance(): ChatWidgetUseCase {
    if (!ChatWidgetUseCase.instance) {
      ChatWidgetUseCase.instance = new ChatWidgetUseCase();
    }
    return ChatWidgetUseCase.instance;
  }

  async initializeChat(config: ChatWidgetConfig): Promise<void> {
    if (!config.enabled) {
      return;
    }

    // Cleanup existing chat if any
    await this.cleanup();

    try {
      // Dynamically import n8n chat to avoid SSR issues
      const { createChat } = await import('@n8n/chat');
      
      // Ensure target element exists
      const targetElement = document.getElementById(config.targetElementId);
      if (!targetElement) {
        throw new Error(`Target element #${config.targetElementId} not found`);
      }

      // Clear any existing content
      targetElement.innerHTML = '';

      this.chatInstance = createChat({
        webhookUrl: config.webhookUrl,
        webhookConfig: {
          method: 'POST',
        },
        target: `#${config.targetElementId}`,
        mode: 'window',
        chatInputKey: 'chatInput',
        chatSessionKey: 'sessionId',
        loadPreviousSession: true,
        metadata: config.metadata,
        showWelcomeScreen: false,
        defaultLanguage: 'en',
        i18n: {
          en: {
            title: 'Xin chào! 👋',
            subtitle: 'Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.',
            footer: '',
            getStarted: 'Bắt đầu trò chuyện',
            inputPlaceholder: 'Nhập tin nhắn của bạn...',
            closeButtonTooltip: 'Đóng chat'
          }
        },
        initialMessages: [
          'Xin chào! 👋 Tôi là trợ lý ảo của 24H Billiard.',
          'Tôi có thể giúp gì cho bạn hôm nay?'
        ],
        enableStreaming: false,
      });

      this.applyCustomStyles(config.targetElementId);
      this.initialized = true;
      
    } catch (error) {
      console.error('Failed to initialize chat widget:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    if (this.chatInstance && typeof this.chatInstance.unmount === 'function') {
      try {
        await this.chatInstance.unmount();
      } catch (error) {
        console.warn('Error unmounting chat:', error);
      }
    }
    
    this.chatInstance = null;
    this.initialized = false;
    
    // Clean up DOM
    const existingStyles = document.querySelectorAll('style[data-chat-widget]');
    existingStyles.forEach(style => style.remove());
  }

  private applyCustomStyles(targetElementId: string): void {
    // Remove existing styles first
    const existingStyles = document.querySelectorAll('style[data-chat-widget]');
    existingStyles.forEach(style => style.remove());

    const style = document.createElement('style');
    style.setAttribute('data-chat-widget', 'true');
    style.textContent = `
      #${targetElementId} {
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        z-index: 9999 !important;
      }
      
      #${targetElementId} .n8n-chat {
        font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      .chat-layout .chat-header{
        background-color: #2b76d2 !important;
        gap: 0 !important;
      }
      .chat-window-wrapper .chat-window-toggle{
        background-color: #2b76d2 !important;
      }
      .chat-layout .chat-header h1{
        font-size: 25px !important;
        font-weight: 600 !important;
      }
      
      @media (max-width: 768px) {
        #${targetElementId} {
          bottom: 10px !important;
          right: 10px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}