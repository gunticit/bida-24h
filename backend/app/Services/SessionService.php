<?php

namespace App\Services;

use App\Models\GameSession;
use App\Models\Order;
use App\Models\Menu;

class SessionService
{
    public function getAll()
    {
        return GameSession::with('table')
            ->orderByRaw("CASE WHEN status = 'playing' THEN 0 ELSE 1 END")
            ->orderBy('id', 'desc')
            ->get();
    }

    public function getTodayOrPlaying()
    {
        return GameSession::with('table')
            ->todayOrPlaying()
            ->orderByRaw("CASE WHEN status = 'playing' THEN 0 ELSE 1 END")
            ->orderBy('end_time', 'desc')
            ->orderBy('start_time', 'desc')
            ->orderBy('id', 'desc')
            ->get();
    }

    public function getPlayingOrLast7Days()
    {
        return GameSession::with('table')
            ->playingOrLast7Days()
            ->orderByRaw("CASE WHEN status = 'playing' THEN 0 ELSE 1 END")
            ->orderBy('end_time', 'desc')
            ->orderBy('start_time', 'desc')
            ->orderBy('id', 'desc')
            ->get();
    }

    public function getToday()
    {
        return GameSession::with('table')
            ->today()
            ->orderByRaw("CASE WHEN status = 'playing' THEN 0 ELSE 1 END")
            ->orderBy('start_time', 'desc')
            ->get();
    }

    public function getById($id)
    {
        return GameSession::with('table')->findOrFail($id);
    }

    public function create(array $data)
    {
        return GameSession::create($data);
    }

    public function update($id, array $data)
    {
        $gameSession = GameSession::findOrFail($id);
        $gameSession->update($data);
        
        // Tự động tính toán nếu có thay đổi về thời gian
        if (isset($data['end_time']) || isset($data['start_time'])) {
            $this->recalculateSession($gameSession);
        }
        
        return $gameSession->fresh();
    }

    public function delete($id)
    {
        $gameSession = GameSession::findOrFail($id);
        $gameSession->delete();
        return true;
    }

    private function recalculateSession(GameSession $gameSession)
    {
        // Tính toán thời gian chơi
        if ($gameSession->end_time && $gameSession->start_time) {
            $gameSession->total_time = $gameSession->start_time->diffInMinutes($gameSession->end_time);
        }

        // Tính toán tiền bàn
        if ($gameSession->total_time) {
            $hours = $gameSession->total_time / 60;
            $gameSession->total_money_table = $hours * $gameSession->hour_price;
        }

        // Tính toán tổng tiền
        $gameSession->total_money = ($gameSession->total_money_table ?? 0) + ($gameSession->total_money_food ?? 0);
        
        $gameSession->save();
    }

    public function addOrderToSession($sessionId, $menuId, $quantity)
    {
        $gameSession = GameSession::findOrFail($sessionId);
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
        $this->updateSessionFoodTotal($gameSession);

        return $order;
    }

    public function removeOrderFromSession($orderId)
    {
        $order = Order::findOrFail($orderId);
        $menu = $order->menu;
        $gameSession = $order->session;

        // Hoàn trả số lượng tồn kho
        $menu->increaseQuantity($order->quantity);

        // Xóa order
        $order->delete();

        // Cập nhật tổng tiền đồ ăn của session
        $this->updateSessionFoodTotal($gameSession);

        return true;
    }

    public function updateOrderQuantity($orderId, $newQuantity)
    {
        $order = Order::findOrFail($orderId);
        $menu = $order->menu;
        $gameSession = $order->session;

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
        $this->updateSessionFoodTotal($gameSession);

        return $order;
    }

    private function updateSessionFoodTotal(GameSession $gameSession)
    {
        $totalFoodMoney = $gameSession->orders()->sum('total_price');
        $gameSession->total_money_food = $totalFoodMoney;
        $gameSession->total_money = ($gameSession->total_money_table ?? 0) + $totalFoodMoney;
        $gameSession->save();
    }
}
