<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\RevenueController;
use Illuminate\Support\Facades\Route;

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

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    
    // User management routes
    Route::apiResource('users', UserController::class);
    
    // Session management routes
    Route::apiResource('sessions', SessionController::class);
    Route::get('/sessions/today-or-playing', [SessionController::class, 'todayOrPlaying']);
    Route::get('/sessions/today', [SessionController::class, 'today']);
    Route::post('/sessions/{sessionId}/orders', [SessionController::class, 'addOrder']);
    Route::delete('/orders/{orderId}', [SessionController::class, 'removeOrder']);
    Route::put('/orders/{orderId}/quantity', [SessionController::class, 'updateOrderQuantity']);
    
    // Menu management routes
    Route::apiResource('menus', MenuController::class);
    Route::get('/menus/available', [MenuController::class, 'available']);
    Route::put('/menus/{id}/quantity', [MenuController::class, 'updateQuantity']);
    Route::post('/menus/{id}/decrease-quantity', [MenuController::class, 'decreaseQuantity']);
    Route::post('/menus/{id}/increase-quantity', [MenuController::class, 'increaseQuantity']);
    
    // Order management routes
    Route::apiResource('orders', OrderController::class);
    
    // Table management routes
    Route::apiResource('tables', TableController::class);
    
    // Revenue statistics routes
    Route::prefix('revenue')->group(function () {
        Route::get('/daily', [RevenueController::class, 'getDailyRevenue']);
        Route::get('/monthly', [RevenueController::class, 'getMonthlyRevenue']);
        Route::get('/yearly', [RevenueController::class, 'getYearlyRevenue']);
        Route::get('/summary', [RevenueController::class, 'getRevenueSummary']);
        Route::get('/top-tables', [RevenueController::class, 'getTopTables']);
        Route::get('/chart', [RevenueController::class, 'getRevenueChart']);
    });
});