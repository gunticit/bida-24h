<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\TakeawayOrderController;
use App\Http\Controllers\Api\DineInOrderController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\RevenueController;
use App\Http\Controllers\Api\SessionReportController;
use App\Http\Controllers\Api\QRTableController;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ExpenseController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// QR Table routes (public access for scanning)
Route::get('/qr/table/{tableId}', [QRTableController::class, 'scanTable']);
Route::post('/qr/table/{tableId}/request-booking', [QRTableController::class, 'requestBooking']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    
    // User management routes
    Route::apiResource('users', UserController::class);
    
    // Session management routes
    Route::get('/sessions/today-or-playing', [SessionController::class, 'todayOrPlaying']);
    Route::get('/sessions/playing-or-last7days', [SessionController::class, 'playingOrLast7Days']);
    Route::post('/sessions/{sessionId}/orders', [SessionController::class, 'addOrder']);
    Route::get('/sessions/today', [SessionController::class, 'today']);
    
    // Session report routes
    Route::get('/sessions/report', [SessionReportController::class, 'report']);
    Route::get('/sessions/report/download', [SessionReportController::class, 'downloadReport']);
    Route::post('/sessions/report/generate', [SessionReportController::class, 'generateReport']);
    
    Route::delete('/orders/{orderId}', [SessionController::class, 'removeOrder']);
    Route::put('/orders/{orderId}/quantity', [SessionController::class, 'updateOrderQuantity']);
    Route::apiResource('sessions', SessionController::class);
    
    // Menu management routes
    Route::get('/menus/available', [MenuController::class, 'available']);
    Route::put('/menus/{id}/quantity', [MenuController::class, 'updateQuantity']);
    Route::post('/menus/{id}/decrease-quantity', [MenuController::class, 'decreaseQuantity']);
    Route::post('/menus/{id}/increase-quantity', [MenuController::class, 'increaseQuantity']);
    Route::apiResource('menus', MenuController::class);
    
    // Order management routes (old - for session orders)
    Route::get('/orders/takeaway', [OrderController::class, 'getTakeawayOrders']);
    Route::post('/orders/takeaway', [OrderController::class, 'createTakeawayOrder']);
    Route::apiResource('orders', OrderController::class);
    
    // Takeaway Order management routes (new dedicated system)
    Route::get('/takeaway-orders/today', [TakeawayOrderController::class, 'todayOrders']);
    Route::get('/takeaway-orders/report', [TakeawayOrderController::class, 'report']);
    Route::get('/takeaway-orders/report/download', [TakeawayOrderController::class, 'downloadReport']);
    Route::post('/takeaway-orders/report/generate', [TakeawayOrderController::class, 'generateReport']);
    Route::apiResource('takeaway-orders', TakeawayOrderController::class);
    
    // Dine-in Order management routes
    Route::get('/dine-in-orders/today', [DineInOrderController::class, 'todayOrders']);
    Route::get('/dine-in-orders/report', [DineInOrderController::class, 'report']);
    Route::get('/dine-in-orders/report/download', [DineInOrderController::class, 'downloadReport']);
    Route::post('/dine-in-orders/report/generate', [DineInOrderController::class, 'generateReport']);
    Route::apiResource('dine-in-orders', DineInOrderController::class);
    
    // Table management routes
    Route::apiResource('tables', TableController::class);
    
    // QR Table routes (authenticated)
    Route::post('/qr/table/{tableId}/auto-book', [QRTableController::class, 'autoBookTable']);
    
    // Booking Request management (admin/staff only)
    Route::get('/booking-requests', [QRTableController::class, 'getBookingRequests']);
    Route::post('/booking-requests/{requestId}/handle', [QRTableController::class, 'handleBookingRequest']);
    
    // Revenue statistics routes
    Route::prefix('revenue')->group(function () {
        Route::get('/daily', [RevenueController::class, 'getDailyRevenue']);
        Route::get('/monthly', [RevenueController::class, 'getMonthlyRevenue']);
        Route::get('/yearly', [RevenueController::class, 'getYearlyRevenue']);
        Route::get('/top-tables', [RevenueController::class, 'getTopTables']);
        Route::get('/chart', [RevenueController::class, 'getRevenueChart']);
    });

    // Expense management routes
    Route::get('/expenses-summary', [ExpenseController::class, 'summary']);
    Route::apiResource('expenses', ExpenseController::class);
    
    // Notification routes (admin/staff only)
    Route::get('/notifications', [NotificationController::class, 'getNotifications']);
    Route::post('/notifications/{notificationId}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications', [NotificationController::class, 'clearAll']);
});