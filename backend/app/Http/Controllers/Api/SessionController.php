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
            $sessions = $this->service->getAll();
            return response()->json($sessions);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tải danh sách sessions'], 500);
        }
    }

    public function todayOrPlaying()
    {
        try {
            $sessions = $this->service->getTodayOrPlaying();
            return response()->json($sessions);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tải danh sách sessions hôm nay hoặc đang chơi'], 500);
        }
    }

    public function today()
    {
        try {
            $sessions = $this->service->getToday();
            return response()->json($sessions);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tải danh sách sessions hôm nay'], 500);
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
            
            $session = $this->service->create($validated);
            return response()->json($session, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tạo session'], 500);
        }
    }

    public function show($id)
    {
        try {
            $session = $this->service->getById($id);
            return response()->json($session);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Session không tồn tại'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tải thông tin session'], 500);
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

            $session = $this->service->update($id, $validated);
            return response()->json($session);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $e->errors()], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Session không tồn tại'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể cập nhật session'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $this->service->delete($id);
            return response()->json(['message' => 'Session đã được xóa thành công']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Session không tồn tại'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể xóa session'], 500);
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
