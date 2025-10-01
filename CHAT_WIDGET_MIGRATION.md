# 🔧 Chat Widget Migration Guide - Clean Architecture

## 🎯 Problem Solved

**Original Issue**: "There is already an app instance mounted on the host container"
- N8N chat widget was mounting multiple times on the same DOM element
- No proper cleanup mechanism
- Authentication state management scattered
- No clear separation of concerns

## ✅ Solution Implemented

### 1. **Clean Architecture Structure**
```
frontend/src/
├── domain/entities/           # Business entities
├── application/use-cases/     # Business logic
│   ├── auth/
│   │   ├── AuthStateUseCase.ts    # Authentication state management
│   │   ├── LoginUseCase.ts        # Login business logic
│   │   └── LogoutUseCase.ts       # Logout with cleanup
│   └── chat/
│       ├── ChatWidgetUseCase.ts   # Chat widget lifecycle
│       └── ChatWidgetService.ts   # Chat business rules
├── presentation/hooks/        # React hooks
│   └── useChatWidget.ts       # Clean chat hook
└── infrastructure/api/        # External services
```

### 2. **Singleton Pattern for Chat Management**
- `ChatWidgetUseCase` implements Singleton pattern
- Ensures only one chat instance exists
- Proper cleanup with `unmount()` method
- Error handling and recovery

### 3. **Separation of Concerns**
- **Domain**: Business rules and entities
- **Application**: Use cases and business logic
- **Presentation**: React components and hooks
- **Infrastructure**: External API integration

## 🔄 Migration Steps

### Step 1: Replace Old Component Usage
**Before:**
```tsx
import GlobalChatWidget from '@/components/chat/GlobalChatWidget'

// In layout or page
<GlobalChatWidget enabled={true} />
```

**After:**
```tsx
import GlobalChatWidget from '@/components/chat/GlobalChatWidget'

// In layout or page (same usage, improved implementation)
<GlobalChatWidget 
  enabled={true} 
  webhookUrl="https://vface.id.vn/webhook/85a70869-78e4-452a-9779-d151bf283c1a/chat"
  targetElementId="global-n8n-chat"
/>
```

### Step 2: Update Imports (if using hook directly)
**Before:**
```tsx
import { useChatWidget } from '@/hook/chat/useChatWidget'
```

**After:**
```tsx
import { useChatWidget } from '@/presentation/hooks/useChatWidget'
```

### Step 3: Enhanced Error Handling
The new implementation provides:
- Automatic retry mechanism
- Development-mode error UI
- Graceful fallbacks
- Proper cleanup on navigation

## 🚀 Key Benefits

### 1. **Mounting Issue Fixed**
- ✅ Proper unmounting before remounting
- ✅ DOM cleanup on navigation
- ✅ No duplicate instances

### 2. **Clean Architecture**
- ✅ Testable business logic
- ✅ Framework-independent use cases
- ✅ Clear separation of concerns
- ✅ Easy to maintain and extend

### 3. **Better Error Handling**
- ✅ Graceful error recovery
- ✅ User-friendly error messages
- ✅ Development debugging tools

### 4. **Performance Improvements**
- ✅ Singleton pattern reduces overhead
- ✅ Proper cleanup prevents memory leaks
- ✅ Efficient DOM manipulation

## 🧪 Testing Strategy

### Unit Tests (Use Cases)
```typescript
// Test authentication state management
describe('AuthStateUseCase', () => {
  it('should check authentication status', () => {
    const authUseCase = AuthStateUseCase.getInstance()
    const state = authUseCase.checkAuthenticationStatus()
    expect(state).toBeDefined()
  })
})

// Test chat widget business logic
describe('ChatWidgetService', () => {
  it('should determine when to show chat', () => {
    const service = new ChatWidgetServiceImpl()
    const shouldShow = service.shouldShowChat('/dashboard', true, true)
    expect(shouldShow).toBe(true)
  })
})
```

### Integration Tests (Hooks)
```typescript
// Test React hook integration
describe('useChatWidget', () => {
  it('should initialize chat when authenticated', async () => {
    const { result } = renderHook(() => useChatWidget())
    await waitFor(() => {
      expect(result.current.shouldShowChat).toBe(true)
    })
  })
})
```

## 🔧 Configuration Options

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_CHAT_WEBHOOK_URL=https://vface.id.vn/webhook/...
```

### Component Props
```typescript
interface GlobalChatWidgetProps {
  enabled?: boolean                    // Enable/disable chat
  webhookUrl?: string                  // Custom webhook URL
  targetElementId?: string             // Custom DOM target
}
```

## 📊 Monitoring & Debugging

### Development Mode
- Error UI shows chat initialization issues
- Console logging for debugging
- Retry mechanism for failed initializations

### Production Mode
- Silent error handling
- Graceful fallbacks
- Performance monitoring ready

## 🎯 Next Steps

1. **Add Unit Tests** for all use cases
2. **Performance Monitoring** integration
3. **A/B Testing** capabilities
4. **Analytics Integration** for chat usage
5. **Offline Support** for chat widget

## ✅ Verification Checklist

- [ ] No "app instance mounted" errors
- [ ] Chat initializes correctly on authenticated pages
- [ ] Chat cleans up on navigation
- [ ] Error handling works in development
- [ ] Authentication state updates properly
- [ ] Mobile responsiveness maintained
- [ ] Performance is improved
- [ ] Code is maintainable and testable

The chat widget now follows Clean Architecture principles and resolves the mounting issue! 🎉