<?php

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use App\Services\SessionService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SessionController extends Controller
{
    protected $service;

    public function __construct(SessionService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        try {
            $gameSessions = $this->service->getAll();
            return response()->json($gameSessions);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tải danh sách giờ chơi'], 500);
        }
    }

    public function todayOrPlaying()
    {
        try {
            $gameSessions = $this->service->getTodayOrPlaying();
            return response()->json($gameSessions);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tải danh sách giờ chơi hôm nay hoặc đang chơi'], 500);
        }
    }

    public function playingOrLast7Days()
    {
        try {
            $gameSessions = $this->service->getPlayingOrLast7Days();
            return response()->json($gameSessions);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tải danh sách giờ chơi đang chơi hoặc 7 ngày qua'], 500);
        }
    }

    public function today()
    {
        try {
            $gameSessions = $this->service->getToday();
            return response()->json($gameSessions);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tải danh sách giờ chơi hôm nay'], 500);
        }
    }

    /**
     * Get sessions by date range (for monthly filtering)
     */
    public function byDateRange(Request $request)
    {
        try {
            $validated = $request->validate([
                'from' => 'required|date',
                'to' => 'required|date|after_or_equal:from',
            ]);

            $gameSessions = $this->service->getByDateRange($validated['from'], $validated['to']);
            return response()->json($gameSessions);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tải danh sách giờ chơi theo khoảng thời gian'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'table_id' => 'required|integer|exists:tables,id',
                'start_time' => 'required|date',
                'hour_price' => 'required|numeric|min:0',
                'status' => ['sometimes', Rule::in(['playing', 'finished', 'canceled'])],
            ]);

            $validated['status'] = $validated['status'] ?? 'playing';
            
            $gameSessions = $this->service->create($validated);
            return response()->json($gameSessions, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tạo giờ chơi'], 500);
        }
    }

    public function show($id)
    {
        try {
            $gameSession = $this->service->getById($id);
            return response()->json($gameSession);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Giờ chơi không tồn tại'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tải thông tin giờ chơi'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'table_id' => 'sometimes|integer|exists:tables,id',
                'start_time' => 'sometimes|date',
                'end_time' => 'sometimes|nullable|date|after:start_time',
                'hour_price' => 'sometimes|numeric|min:0',
                'status' => ['sometimes', Rule::in(['playing', 'finished', 'canceled'])],
                'total_money_food' => 'sometimes|numeric|min:0',
                'total_money' => 'sometimes|numeric|min:0',
                'total_money_table' => 'sometimes|numeric|min:0',
            ]);

            $gameSession = $this->service->update($id, $validated);
            return response()->json($gameSession);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $e->errors()], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Giờ chơi không tồn tại'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể cập nhật giờ chơi'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $this->service->delete($id);
            return response()->json(['message' => 'Giờ chơi đã được xóa thành công']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Giờ chơi không tồn tại'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể xóa giờ chơi'], 500);
        }
    }

    public function addOrder(Request $request, $sessionId)
    {
        try {
            $validated = $request->validate([
                'menu_id' => 'required|integer|exists:menus,id',
                'quantity' => 'required|integer|min:1'
            ]);

            $order = $this->service->addOrderToSession($sessionId, $validated['menu_id'], $validated['quantity']);
            return response()->json($order, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function removeOrder($orderId)
    {
        try {
            $this->service->removeOrderFromSession($orderId);
            return response()->json(['message' => 'Order đã được xóa thành công']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Order không tồn tại'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể xóa order'], 500);
        }
    }

    public function updateOrderQuantity(Request $request, $orderId)
    {
        try {
            $validated = $request->validate([
                'quantity' => 'required|integer|min:1'
            ]);

            $order = $this->service->updateOrderQuantity($orderId, $validated['quantity']);
            return response()->json($order);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
