<?php

namespace App\Services;

use App\Models\Session;
use App\Models\Order;
use App\Models\Menu;
use Illuminate\Support\Facades\DB;

class SessionService
{
    public function getAll()
    {
        return Session::with('table')
            ->orderByRaw("CASE WHEN status = 'playing' THEN 0 ELSE 1 END")
            ->orderBy('id', 'desc')
            ->get();
    }

    public function getTodayOrPlaying()
    {
        return Session::with('table')
            ->todayOrPlaying()
            ->orderByRaw("CASE WHEN status = 'playing' THEN 0 ELSE 1 END")
            ->orderBy('start_time', 'desc')
            ->get();
    }

    public function getToday()
    {
        return Session::with('table')
            ->today()
            ->orderByRaw("CASE WHEN status = 'playing' THEN 0 ELSE 1 END")
            ->orderBy('start_time', 'desc')
            ->get();
    }

    public function getById($id)
    {
        return Session::with('table')->findOrFail($id);
    }

    public function create(array $data)
    {
        return Session::create($data);
    }

    public function update($id, array $data)
    {
        $session = Session::findOrFail($id);
        $session->update($data);
        
        // Tự động tính toán nếu có thay đổi về thời gian
        if (isset($data['end_time']) || isset($data['start_time'])) {
            $this->recalculateSession($session);
        }
        
        return $session->fresh();
    }

    public function delete($id)
    {
        $session = Session::findOrFail($id);
        $session->delete();
        return true;
    }

    private function recalculateSession(Session $session)
    {
        // Tính toán thời gian chơi
        if ($session->end_time && $session->start_time) {
            $session->total_time = $session->start_time->diffInMinutes($session->end_time);
        }

        // Tính toán tiền bàn
        if ($session->total_time) {
            $hours = $session->total_time / 60;
            $session->total_money_table = $hours * $session->hour_price;
        }

        // Tính toán tổng tiền
        $session->total_money = ($session->total_money_table ?? 0) + ($session->total_money_food ?? 0);
        
        $session->save();
    }

    public function addOrderToSession($sessionId, $menuId, $quantity)
    {
        $session = Session::findOrFail($sessionId);
        $menu = Menu::findOrFail($menuId);

        // Kiểm tra số lượng tồn kho
        if (!$menu->hasEnoughQuantity($quantity)) {
            throw new \Exception("Không đủ số lượng tồn kho cho món: {$menu->name}");
        }

        // Tạo order
        $order = Order::create([
            'session_id' => $sessionId,
            'menu_id' => $menuId,
            'quantity' => $quantity,
            'unit_price' => $menu->price,
            'total_price' => $quantity * $menu->price,
        ]);

        // Trừ số lượng tồn kho
        $menu->decreaseQuantity($quantity);

        // Cập nhật tổng tiền đồ ăn của session
        $this->updateSessionFoodTotal($session);

        return $order;
    }

    public function removeOrderFromSession($orderId)
    {
        $order = Order::findOrFail($orderId);
        $menu = $order->menu;
        $session = $order->session;

        // Hoàn trả số lượng tồn kho
        $menu->increaseQuantity($order->quantity);

        // Xóa order
        $order->delete();

        // Cập nhật tổng tiền đồ ăn của session
        $this->updateSessionFoodTotal($session);

        return true;
    }

    public function updateOrderQuantity($orderId, $newQuantity)
    {
        $order = Order::findOrFail($orderId);
        $menu = $order->menu;
        $session = $order->session;

        $oldQuantity = $order->quantity;
        $quantityDifference = $newQuantity - $oldQuantity;

        if ($quantityDifference > 0) {
            // Tăng số lượng - kiểm tra tồn kho
            if (!$menu->hasEnoughQuantity($quantityDifference)) {
                throw new \Exception("Không đủ số lượng tồn kho cho món: {$menu->name}");
            }
            $menu->decreaseQuantity($quantityDifference);
        } elseif ($quantityDifference < 0) {
            // Giảm số lượng - hoàn trả tồn kho
            $menu->increaseQuantity(abs($quantityDifference));
        }

        // Cập nhật order
        $order->quantity = $newQuantity;
        $order->total_price = $newQuantity * $order->unit_price;
        $order->save();

        // Cập nhật tổng tiền đồ ăn của session
        $this->updateSessionFoodTotal($session);

        return $order;
    }

    private function updateSessionFoodTotal(Session $session)
    {
        $totalFoodMoney = $session->orders()->sum('total_price');
        $session->total_money_food = $totalFoodMoney;
        $session->total_money = ($session->total_money_table ?? 0) + $totalFoodMoney;
        $session->save();
    }
}
