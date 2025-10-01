'use client'

import dynamic from 'next/dynamic'

// Import CSS styles
import '@n8n/chat/style.css'

interface ChatWidgetWrapperProps {
  enabled?: boolean
  webhookUrl?: string
  targetElementId?: string
}

// Dynamic import to avoid SSR issues
const DynamicChatWidget = dynamic(
  () => import('../../presentation/hooks/useChatWidget').then(mod => {
    return function ChatWidgetWrapper(props: ChatWidgetWrapperProps) {
      const { useChatWidget } = mod;
      const { shouldShowChat, error, retry } = useChatWidget(props);

      if (!shouldShowChat) {
        return null;
      }

      return (
        <>
          <div 
            id={props.targetElementId}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 9999
            }}
          />
          
          {/* Error handling UI (optional) */}
          {error && process.env.NODE_ENV === 'development' && (
            <div
              style={{
                position: 'fixed',
                bottom: '100px',
                right: '20px',
                background: 'red',
                color: 'white',
                padding: '10px',
                borderRadius: '5px',
                fontSize: '12px',
                zIndex: 10000,
                maxWidth: '300px'
              }}
            >
              <div>Chat Error: {error}</div>
              <button 
                onClick={retry}
                style={{
                  background: 'white',
                  color: 'red',
                  border: 'none',
                  padding: '5px 10px',
                  marginTop: '5px',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          )}
        </>
      );
    };
  }),
  { 
    ssr: false,
    loading: () => null
  }
)

interface GlobalChatWidgetProps {
  enabled?: boolean
  webhookUrl?: string
  targetElementId?: string
}

export default function GlobalChatWidget({ 
  enabled = true,
  webhookUrl = 'https://vface.id.vn/webhook/85a70869-78e4-452a-9779-d151bf283c1a/chat',
  targetElementId = 'global-n8n-chat'
}: GlobalChatWidgetProps) {
  return (
    <DynamicChatWidget
      enabled={enabled}
      webhookUrl={webhookUrl}
      targetElementId={targetElementId}
    />
  )
}