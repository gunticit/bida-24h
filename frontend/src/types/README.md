# API Types Documentation

This directory contains TypeScript interfaces and types for the billiard management system API.

## Files Structure

### `/types/api.ts`
Contains all the interfaces and types used for API communication:

#### User Management
- `User` - User profile information
- `LoginCredentials` - Login request data
- `RegisterData` - User registration data
- `UpdateProfileData` - Profile update data
- `AuthResponse` - Authentication response

#### Game Sessions
- `GameSession` - Game session data
- `CreateSessionData` - Create session request
- `UpdateSessionData` - Update session request

#### Tables & Menus
- `Table` - Billiard table information
- `MenuItem` - Food/drink menu items
- `Order` - Order information
- `CreateOrderData` - Create order request

#### Takeaway Orders
- `TakeawayOrder` - Takeaway order data
- `TakeawayOrderItem` - Individual items in takeaway order
- `CreateTakeawayOrderData` - Create takeaway order request

#### Expenses
- `Expense` - Expense record
- `ExpenseSummary` - Expense statistics
- `CreateExpenseData` - Create expense request
- `UpdateExpenseData` - Update expense request
- `ExpenseListResponse` - Paginated expense list response

#### Revenue & Analytics
- `RevenueBreakdownItem` - Daily revenue breakdown
- `MonthlyRevenueBreakdownItem` - Monthly revenue breakdown
- `DailyRevenueResponse` - Daily revenue API response
- `MonthlyRevenueResponse` - Monthly revenue API response
- `YearlyRevenueResponse` - Yearly revenue API response

#### Utility Types
- `ApiResponse<T>` - Generic API response wrapper
- `PaginatedResponse<T>` - Generic paginated response
- `MessageResponse` - Simple message response
- `CreateData<T>` - Utility type for create operations
- `UpdateData<T>` - Utility type for update operations

#### Enums & Constants
- `MenuCategory` - Menu item categories
- `TableStatus` - Table status options
- `SessionStatus` - Game session status
- `TakeawayStatus` - Takeaway order status
- `UserRole` - User roles
- `ExpenseCategory` - Expense categories

## Usage

### In Components
```typescript
import { User, GameSession, ExpenseSummary } from '@/types/api'

// Or import from lib/api for backward compatibility
import { User, GameSession } from '@/lib/api'
```

### In API Service
```typescript
import { CreateExpenseData, DailyRevenueResponse } from '@/types/api'

async function createExpense(data: CreateExpenseData): Promise<Expense> {
  // Implementation
}
```

### Type Safety Benefits
- Auto-completion in IDEs
- Compile-time error checking
- Better documentation through types
- Easier refactoring
- Consistent data structures across components

## Best Practices

1. **Always use interfaces** for API data structures
2. **Import specific types** rather than importing everything
3. **Use utility types** like `CreateData<T>` for consistency
4. **Add JSDoc comments** for complex interfaces
5. **Keep interfaces in sync** with backend API schemas

## Maintenance

When adding new API endpoints or modifying existing ones:

1. Update the corresponding interface in `/types/api.ts`
2. Update the API service method in `/lib/api.ts`
3. Update any components using the changed interface
4. Add the new interface to exports if needed

This ensures type safety across the entire frontend application.
