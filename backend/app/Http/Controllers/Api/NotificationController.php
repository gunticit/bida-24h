<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Lấy danh sách notifications realtime từ Redis
     */
    public function getNotifications(Request $request)
    {
        try {
            // Chỉ admin/staff mới có thể xem notifications
            if (!Auth::check() || !in_array(Auth::user()->role, ['admin', 'staff'])) {
                return response()->json([
                    'error' => 'Unauthorized'
                ], 403);
            }

            // Lấy tất cả notifications từ Redis
            $notifications = Redis::lrange('admin_notifications', 0, -1);
            
            $parsedNotifications = [];
            foreach ($notifications as $notification) {
                $data = json_decode($notification, true);
                if ($data) {
                    $parsedNotifications[] = $data;
                }
            }

            // Sort theo thời gian mới nhất
            usort($parsedNotifications, function($a, $b) {
                return strtotime($b['requested_at']) - strtotime($a['requested_at']);
            });

            return response()->json([
                'notifications' => $parsedNotifications,
                'count' => count($parsedNotifications)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Có lỗi xảy ra khi lấy thông báo',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Đánh dấu notification đã đọc (xóa khỏi Redis)
     */
    public function markAsRead($notificationId, Request $request)
    {
        try {
            if (!Auth::check() || !in_array(Auth::user()->role, ['admin', 'staff'])) {
                return response()->json([
                    'error' => 'Unauthorized'
                ], 403);
            }

            // Lấy tất cả notifications
            $notifications = Redis::lrange('admin_notifications', 0, -1);
            
            // Tìm và xóa notification với ID cụ thể
            foreach ($notifications as $index => $notification) {
                $data = json_decode($notification, true);
                if ($data && isset($data['id']) && $data['id'] == $notificationId) {
                    // Xóa notification khỏi Redis
                    Redis::lrem('admin_notifications', 1, $notification);
                    
                    return response()->json([
                        'message' => 'Đã đánh dấu thông báo đã đọc',
                        'notification_id' => $notificationId
                    ]);
                }
            }

            return response()->json([
                'error' => 'Không tìm thấy thông báo'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Có lỗi xảy ra',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa tất cả notifications
     */
    public function clearAll(Request $request)
    {
        try {
            if (!Auth::check() || !in_array(Auth::user()->role, ['admin', 'staff'])) {
                return response()->json([
                    'error' => 'Unauthorized'
                ], 403);
            }

            Redis::del('admin_notifications');

            return response()->json([
                'message' => 'Đã xóa tất cả thông báo'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Có lỗi xảy ra',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}