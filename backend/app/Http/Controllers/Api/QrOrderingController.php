<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Table;
use App\Models\Menu;
use App\Services\SessionService;
use Illuminate\Http\Request;

class QrOrderingController extends Controller
{
    protected $sessionService;

    public function __construct(SessionService $sessionService)
    {
        $this->sessionService = $sessionService;
    }

    /**
     * Get table information and active session by QR token.
     */
    public function getTableByToken($token)
    {
        $table = Table::where('qr_token', $token)->first();

        if (!$table) {
            return response()->json(['message' => 'Mã QR không hợp lệ hoặc bàn không tồn tại'], 404);
        }

        // Include active session if any
        $activeSession = $table->activeSession()->with('orders.menu')->first();

        return response()->json([
            'table' => [
                'id' => $table->id,
                'name' => $table->name,
            ],
            'session' => $activeSession ? [
                'id' => $activeSession->id,
                'start_time' => $activeSession->start_time,
                'hour_price' => $activeSession->hour_price,
                'total_money_food' => $activeSession->total_money_food,
                'orders' => $activeSession->orders,
            ] : null
        ]);
    }

    /**
     * Get available menus for QR ordering (excluding takeaway if applicable)
     */
    public function getMenus()
    {
        // Only show active menus, exclude takeaway, hide exact stock quantity
        $menus = Menu::where('is_active', true)
            ->where('category', '!=', 'takeaway')
            ->where('quantity', '>', 0)
            ->get(['id', 'name', 'price', 'category']);

        return response()->json($menus);
    }

    /**
     * Place order from QR scan
     */
    public function placeOrder(Request $request, $token)
    {
        try {
            $table = Table::where('qr_token', $token)->first();

            if (!$table) {
                return response()->json(['message' => 'Mã QR không hợp lệ'], 404);
            }

            $activeSession = $table->activeSession()->first();

            if (!$activeSession) {
                return response()->json(['message' => 'Bàn chưa được mở, vui lòng liên hệ nhân viên'], 400);
            }

            $validated = $request->validate([
                'items' => 'required|array|min:1|max:20',
                'items.*.menu_id' => 'required|integer|exists:menus,id',
                'items.*.quantity' => 'required|integer|min:1|max:50'
            ]);

            $orders = [];
            \DB::beginTransaction();
            try {
                foreach ($validated['items'] as $item) {
                    // Server-side: verify menu is active, not takeaway, has stock
                    $menu = Menu::find($item['menu_id']);
                    if (!$menu || !$menu->is_active) {
                        $menuName = $menu ? $menu->name : $item['menu_id'];
                        throw new \Exception("Món '{$menuName}' không khả dụng");
                    }
                    if ($menu->category === 'takeaway') {
                        throw new \Exception("Không thể đặt món mang về qua QR");
                    }

                    // Thêm order với status là 'pending' (chờ đợi)
                    $order = $this->sessionService->addOrderToSession(
                        $activeSession->id, 
                        $item['menu_id'], 
                        $item['quantity'], 
                        'pending'
                    );
                    // Eager load menu for response
                    $order->load('menu');
                    $orders[] = $order;

                    // Broadcast event for realtime notification (fail silently)
                    try {
                        event(new \App\Events\OrderPlacedEvent($order, $table->name));
                    } catch (\Exception $e) {
                        \Log::warning('Broadcast failed: ' . $e->getMessage());
                    }
                }
                \DB::commit();
            } catch (\Exception $e) {
                \DB::rollBack();
                throw $e;
            }

            return response()->json([
                'message' => 'Đặt món thành công, vui lòng chờ nhân viên xác nhận',
                'orders' => $orders
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
