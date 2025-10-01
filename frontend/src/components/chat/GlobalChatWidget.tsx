'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import '@n8n/chat/style.css'
import { createChat } from '@n8n/chat'
import { apiService } from '@/lib/api'

// Pages that should NOT have chat widget (unauthenticated pages)
const EXCLUDED_PAGES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
]

interface GlobalChatWidgetProps {
  enabled?: boolean
}

export default function GlobalChatWidget({ enabled = true }: GlobalChatWidgetProps) {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [chatInitialized, setChatInitialized] = useState(false)

  // Check if current page should have chat widget
  const shouldShowChat = enabled && 
    !EXCLUDED_PAGES.some(page => pathname.startsWith(page)) && 
    isAuthenticated

  useEffect(() => {
    // Check authentication status
    const token = apiService.getToken()
    setIsAuthenticated(!!token)
  }, [pathname])

  useEffect(() => {
    if (!shouldShowChat || chatInitialized) return

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      try {
        createChat({
          webhookUrl: 'https://vface.id.vn/webhook/85a70869-78e4-452a-9779-d151bf283c1a/chat',
          webhookConfig: {
            method: 'POST',
          },
          target: '#global-n8n-chat',
          mode: 'window',
          chatInputKey: 'chatInput',
          chatSessionKey: 'sessionId',
          loadPreviousSession: true,
          metadata: {
            page: pathname,
            timestamp: new Date().toISOString()
          },
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
        })
        setChatInitialized(true)
        
        // Apply custom styles
        const style = document.createElement('style')
        style.textContent = `
          #global-n8n-chat {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            z-index: 9999 !important;
          }
          
          #global-n8n-chat .n8n-chat {
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
            #global-n8n-chat {
              bottom: 10px !important;
              right: 10px !important;
            }
          }
        `
        document.head.appendChild(style)
        
      } catch (error) {
        console.error('Failed to initialize chat widget:', error)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [shouldShowChat, chatInitialized, pathname])

  // Reset chat when page changes or authentication changes
  useEffect(() => {
    setChatInitialized(false)
  }, [pathname, isAuthenticated])

  if (!shouldShowChat) {
    return null
  }

  return (
    <div 
      id="global-n8n-chat"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999
      }}
    />
  )
}