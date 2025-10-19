<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Table;
use App\Models\GameSession;
use App\Models\User;
use App\Models\BookingRequest;
use App\Services\SessionService;
use App\Events\BookingRequestCreated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Redis;
use Carbon\Carbon;

class QRTableController extends Controller
{
    protected $sessionService;

    public function __construct(SessionService $sessionService)
    {
        $this->sessionService = $sessionService;
    }

    /**
     * Xử lý scan QR code của bàn
     */
    public function scanTable($tableId, Request $request)
    {
        try {
            // Tìm bàn theo ID
            $table = Table::findOrFail($tableId);
            
            // Kiểm tra session đang hoạt động của bàn
            $activeSession = GameSession::where('table_id', $tableId)
                ->where('status', 'playing')
                ->first();

            $response = [
                'table' => [
                    'id' => $table->id,
                    'name' => $table->name,
                    'status' => $table->status,
                    'price_per_hour' => $table->price_per_hour,
                ],
                'is_available' => $table->status === 'available' && !$activeSession,
                'active_session' => $activeSession ? [
                    'id' => $activeSession->id,
                    'start_time' => $activeSession->start_time,
                    'duration_minutes' => (int) Carbon::parse($activeSession->start_time)->diffInMinutes(Carbon::now()),
                ] : null,
            ];

            // Nếu user đã đăng nhập
            if (Auth::check()) {
                $response['user'] = [
                    'id' => Auth::id(),
                    'name' => Auth::user()->name,
                    'role' => Auth::user()->role,
                ];
                
                // Nếu bàn available và user đã đăng nhập, có thể tự động đặt bàn
                if ($response['is_available']) {
                    $response['can_auto_book'] = true;
                }
            } else {
                $response['user'] = null;
                $response['can_request_booking'] = $response['is_available'];
            }

            return response()->json($response);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Không tìm thấy bàn hoặc có lỗi xảy ra',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Tự động đặt bàn (cho user đã đăng nhập)
     */
    public function autoBookTable($tableId, Request $request)
    {
        try {
            // Kiểm tra authentication
            if (!Auth::check()) {
                return response()->json([
                    'error' => 'Vui lòng đăng nhập để đặt bàn'
                ], 401);
            }

            $table = Table::findOrFail($tableId);

            // Kiểm tra bàn có sẵn không
            if ($table->status !== 'available') {
                return response()->json([
                    'error' => 'Bàn không sẵn sàng để đặt'
                ], 400);
            }

            // Kiểm tra có session đang hoạt động không
            $activeSession = GameSession::where('table_id', $tableId)
                ->where('status', 'playing')
                ->first();

            if ($activeSession) {
                return response()->json([
                    'error' => 'Bàn đang được sử dụng'
                ], 400);
            }

            // Tạo session mới
            $sessionData = [
                'table_id' => $tableId,
                'start_time' => Carbon::now()->format('Y-m-d H:i:s'),
                'hour_price' => $table->price_per_hour,
                'status' => 'playing'
            ];

            $session = $this->sessionService->create($sessionData);

            // Cập nhật status bàn
            $table->update(['status' => 'playing']);

            return response()->json([
                'message' => 'Đặt bàn thành công!',
                'session' => [
                    'id' => $session->id,
                    'table_id' => $session->table_id,
                    'start_time' => $session->start_time,
                    'hour_price' => $session->hour_price,
                    'status' => $session->status,
                ],
                'table' => [
                    'id' => $table->id,
                    'name' => $table->name,
                    'status' => $table->status,
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Có lỗi xảy ra khi đặt bàn',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Request đặt bàn (không cần thông tin khách hàng - chỉ tạo thông báo)
     */
    public function requestBooking($tableId, Request $request)
    {
        try {
            $table = Table::findOrFail($tableId);

            // Kiểm tra bàn có sẵn không
            if ($table->status !== 'available') {
                return response()->json([
                    'error' => 'Bàn không sẵn sàng để đặt'
                ], 400);
            }

            // Kiểm tra xem đã có request pending cho bàn này chưa
            $existingRequest = BookingRequest::where('table_id', $tableId)
                ->where('status', 'pending')
                ->where('requested_at', '>=', Carbon::now()->subMinutes(5)) // Trong 5 phút gần đây
                ->first();

            if ($existingRequest) {
                return response()->json([
                    'message' => 'Yêu cầu đặt bàn đã được gửi trước đó. Nhân viên sẽ đến hỗ trợ sớm nhất.',
                    'booking_request' => [
                        'id' => $existingRequest->id,
                        'table_id' => $existingRequest->table_id,
                        'table_name' => $table->name,
                        'status' => $existingRequest->status,
                        'requested_at' => $existingRequest->requested_at,
                    ]
                ], 200);
            }

            // Tạo booking request mới
            $bookingRequest = BookingRequest::create([
                'table_id' => $tableId,
                'request_ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => 'pending',
                'requested_at' => Carbon::now(),
            ]);

            // Gửi realtime notification đến admin/nhân viên
            broadcast(new BookingRequestCreated($tableId, $table->name))->toOthers();
            
            // Lưu vào Redis cho real-time polling (fallback)
            $notificationData = [
                'id' => $bookingRequest->id,
                'type' => 'booking_request',
                'table_id' => $tableId,
                'table_name' => $table->name,
                'message' => "Có yêu cầu đặt bàn {$table->name}",
                'requested_at' => $bookingRequest->requested_at->toISOString(),
                'status' => 'pending'
            ];
            
            Redis::lpush('admin_notifications', json_encode($notificationData));
            Redis::expire('admin_notifications', 3600); // Expire sau 1 giờ

            return response()->json([
                'message' => 'Đã thông báo nhân viên! Nhân viên sẽ đến hỗ trợ bạn trong giây lát.',
                'booking_request' => [
                    'id' => $bookingRequest->id,
                    'table_id' => $bookingRequest->table_id,
                    'table_name' => $table->name,
                    'status' => $bookingRequest->status,
                    'requested_at' => $bookingRequest->requested_at,
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Có lỗi xảy ra khi gửi thông báo',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy danh sách booking requests (cho admin/nhân viên)
     */
    public function getBookingRequests(Request $request)
    {
        try {
            $requests = BookingRequest::with(['table', 'handledBy'])
                ->when($request->status, function ($query, $status) {
                    return $query->where('status', $status);
                })
                ->when($request->today, function ($query) {
                    return $query->today();
                })
                ->orderBy('requested_at', 'desc')
                ->paginate(20);

            return response()->json($requests);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Có lỗi xảy ra khi tải danh sách yêu cầu',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xử lý booking request (approve/reject)
     */
    public function handleBookingRequest($requestId, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'action' => 'required|in:approve,reject',
            'admin_notes' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $bookingRequest = BookingRequest::findOrFail($requestId);
            
            if ($bookingRequest->status !== 'pending') {
                return response()->json([
                    'error' => 'Yêu cầu này đã được xử lý'
                ], 400);
            }

            $status = $request->action === 'approve' ? 'approved' : 'rejected';
            
            $bookingRequest->update([
                'status' => $status,
                'handled_at' => Carbon::now(),
                'handled_by' => Auth::id(),
                'admin_notes' => $request->admin_notes,
            ]);

            // Nếu approve, tự động tạo session
            if ($request->action === 'approve') {
                $table = Table::findOrFail($bookingRequest->table_id);
                
                if ($table->status === 'available') {
                    $sessionData = [
                        'table_id' => $table->id,
                        'start_time' => Carbon::now()->format('Y-m-d H:i:s'),
                        'hour_price' => $table->price_per_hour,
                        'status' => 'playing'
                    ];

                    $session = $this->sessionService->create($sessionData);
                    $table->update(['status' => 'playing']);
                    
                    $bookingRequest->update(['status' => 'completed']);
                }
            }

            return response()->json([
                'message' => $request->action === 'approve' ? 'Đã duyệt và tạo session cho bàn' : 'Đã từ chối yêu cầu',
                'booking_request' => $bookingRequest->load(['table', 'handledBy'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Có lỗi xảy ra khi xử lý yêu cầu',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}