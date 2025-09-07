<?php

namespace App\Services;

use App\Models\Session;
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
}
