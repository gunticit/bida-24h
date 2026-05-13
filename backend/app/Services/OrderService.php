<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Menu;
use Illuminate\Support\Facades\DB;
use Exception;

class OrderService
{
    public function getAll()
    {
        return Order::with(['menu', 'session.table'])->get();
    }

    public function getById($id)
    {
        return Order::findOrFail($id);
    }

    public function create(array $data)
    {
        // Sử dụng transaction để đảm bảo tính nhất quán
        try {
            DB::beginTransaction();
            
            // Lấy thông tin menu và lock record để tránh race condition
            $menu = Menu::where('id', $data['menu_id'])
                        ->where('is_active', true)
                        ->lockForUpdate()
                        ->first();
            
            if (!$menu) {
                throw new Exception('Sản phẩm không tồn tại hoặc đã ngừng kinh doanh');
            }

            // Kiểm tra số lượng tồn kho
            if ($menu->quantity < $data['quantity']) {
                throw new Exception('Số lượng sản phẩm không đủ. Còn lại: ' . $menu->quantity . ' sản phẩm');
            }

            // Trừ số lượng trong menu
            $menu->quantity -= $data['quantity'];
            $menu->save();

            // Tự động set unit_price và total_price từ menu nếu không có
            $orderData = $data;
            $orderData['unit_price'] = $orderData['unit_price'] ?? $menu->price;
            $orderData['total_price'] = $orderData['total_price'] ?? ($menu->price * $data['quantity']);
            
            $order = Order::create($orderData);
            
            DB::commit();
            
            return [
                'order' => $order,
                'message' => 'Đặt hàng thành công',
                'remaining_quantity' => $menu->quantity
            ];
            
        } catch (Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    public function update($id, array $data)
    {
        $order = Order::findOrFail($id);
        $order->update($data);
        return $order;
    }

    public function createWithoutInventoryCheck(array $data)
    {
        // Tạo order không kiểm tra và trừ số lượng (dùng cho trường hợp đặc biệt)
        return Order::create($data);
    }

    public function delete($id)
    {
        try {
            DB::beginTransaction();
            
            // Lấy thông tin order
            $order = Order::findOrFail($id);
            
            // Lấy menu và lock record
            $menu = Menu::where('id', $order->menu_id)
                        ->lockForUpdate()
                        ->first();
            
            if ($menu) {
                // Hoàn lại số lượng
                $menu->quantity += $order->quantity;
                $menu->save();
            }
            
            // Xóa order
            $order->delete();
            
            DB::commit();
            
            return [
                'message' => 'Xóa order thành công và hoàn lại số lượng',
                'restored_quantity' => $order->quantity
            ];
            
        } catch (Exception $e) {
            DB::rollback();
            throw $e;
        }
    }
}
