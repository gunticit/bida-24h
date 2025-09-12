<?php

namespace App\Services;

use App\Models\GameSession;
use App\Models\Order;
use App\Models\TakeawayOrder;
use Carbon\Carbon;

class RevenueService
{
    public function getDailyRevenue($date = null)
    {
        $date = $date ? Carbon::parse($date) : Carbon::today();
        
        $sessions = GameSession::whereDate('start_time', $date)
            ->where('status', 'finished')
            ->get();

        $totalTableRevenue = $sessions->sum('total_money_table') ?? 0;
        $totalFoodRevenue = $sessions->sum('total_money_food') ?? 0;
        
        // Tính takeaway revenue từ bảng takeaway_orders mới
        $takeawayRevenue = TakeawayOrder::whereDate('order_date', $date)
            ->whereIn('status', ['completed'])
            ->sum('total_amount') ?? 0;
            
        $totalRevenue = ($sessions->sum('total_money') ?? 0) + $takeawayRevenue;
        $sessionCount = $sessions->count();

        return [
            'date' => $date->format('Y-m-d'),
            'total_revenue' => $totalRevenue,
            'table_revenue' => $totalTableRevenue,
            'food_revenue' => $totalFoodRevenue,
            'takeaway_revenue' => $takeawayRevenue,
            'session_count' => $sessionCount,
            'sessions' => $sessions->map(function ($session) {
                return [
                    'id' => $session->id,
                    'table_name' => $session->table->name ?? 'N/A',
                    'start_time' => $session->start_time->format('H:i'),
                    'end_time' => $session->end_time ? $session->end_time->format('H:i') : null,
                    'total_time' => $session->total_time,
                    'table_revenue' => $session->total_money_table ?? 0,
                    'food_revenue' => $session->total_money_food ?? 0,
                    'total_revenue' => $session->total_money ?? 0,
                ];
            })
        ];
    }

    public function getMonthlyRevenue($year = null, $month = null)
    {
        $year = $year ?? Carbon::now()->year;
        $month = $month ?? Carbon::now()->month;
        
        $sessions = GameSession::whereYear('start_time', $year)
            ->whereMonth('start_time', $month)
            ->where('status', 'finished')
            ->get();

        $totalTableRevenue = $sessions->sum('total_money_table') ?? 0;
        $totalFoodRevenue = $sessions->sum('total_money_food') ?? 0;
        
        // Tính takeaway revenue cho tháng từ bảng takeaway_orders
        $takeawayRevenue = TakeawayOrder::whereYear('order_date', $year)
            ->whereMonth('order_date', $month)
            ->whereIn('status', ['completed'])
            ->sum('total_amount') ?? 0;
            
        $totalRevenue = ($sessions->sum('total_money') ?? 0) + $takeawayRevenue;
        $sessionCount = $sessions->count();

        // Tính doanh thu theo ngày trong tháng
        $dailyBreakdown = $sessions->groupBy(function ($session) {
            return $session->start_time->format('Y-m-d');
        })->map(function ($daySessions) {
            $date = $daySessions->first()->start_time->format('Y-m-d');
            
            // Tính takeaway cho ngày này từ bảng takeaway_orders
            $dayTakeaway = TakeawayOrder::whereDate('order_date', $date)
                ->whereIn('status', ['completed'])
                ->sum('total_amount') ?? 0;
            
            return [
                'date' => $date,
                'total_revenue' => ($daySessions->sum('total_money') ?? 0) + $dayTakeaway,
                'table_revenue' => $daySessions->sum('total_money_table') ?? 0,
                'food_revenue' => $daySessions->sum('total_money_food') ?? 0,
                'takeaway_revenue' => $dayTakeaway,
                'session_count' => $daySessions->count(),
            ];
        })->values();

        return [
            'year' => $year,
            'month' => $month,
            'month_name' => Carbon::create($year, $month)->format('F Y'),
            'total_revenue' => $totalRevenue,
            'table_revenue' => $totalTableRevenue,
            'food_revenue' => $totalFoodRevenue,
            'takeaway_revenue' => $takeawayRevenue,
            'session_count' => $sessionCount,
            'daily_breakdown' => $dailyBreakdown,
        ];
    }

    public function getYearlyRevenue($year = null)
    {
        $year = $year ?? Carbon::now()->year;
        
        $sessions = GameSession::whereYear('start_time', $year)
            ->where('status', 'finished')
            ->get();

        $totalTableRevenue = $sessions->sum('total_money_table') ?? 0;
        $totalFoodRevenue = $sessions->sum('total_money_food') ?? 0;
        
        // Tính takeaway revenue cho năm từ bảng takeaway_orders
        $takeawayRevenue = TakeawayOrder::whereYear('order_date', $year)
            ->whereIn('status', ['completed'])
            ->sum('total_amount') ?? 0;
            
        $totalRevenue = ($sessions->sum('total_money') ?? 0) + $takeawayRevenue;
        $sessionCount = $sessions->count();

        // Tính doanh thu theo tháng trong năm
        $monthlyBreakdown = $sessions->groupBy(function ($session) {
            return $session->start_time->format('Y-m');
        })->map(function ($monthSessions) {
            $firstSession = $monthSessions->first();
            $year = $firstSession->start_time->year;
            $month = $firstSession->start_time->month;
            
            // Tính takeaway cho tháng này từ bảng takeaway_orders
            $monthTakeaway = TakeawayOrder::whereYear('order_date', $year)
                ->whereMonth('order_date', $month)
                ->whereIn('status', ['completed'])
                ->sum('total_amount') ?? 0;
            
            return [
                'year' => $year,
                'month' => $month,
                'month_name' => $firstSession->start_time->format('F Y'),
                'total_revenue' => ($monthSessions->sum('total_money') ?? 0) + $monthTakeaway,
                'table_revenue' => $monthSessions->sum('total_money_table') ?? 0,
                'food_revenue' => $monthSessions->sum('total_money_food') ?? 0,
                'takeaway_revenue' => $monthTakeaway,
                'session_count' => $monthSessions->count(),
            ];
        })->values();

        return [
            'year' => $year,
            'total_revenue' => $totalRevenue,
            'table_revenue' => $totalTableRevenue,
            'food_revenue' => $totalFoodRevenue,
            'takeaway_revenue' => $takeawayRevenue,
            'session_count' => $sessionCount,
            'monthly_breakdown' => $monthlyBreakdown,
        ];
    }

    public function getRevenueSummary($period = 'today')
    {
        switch ($period) {
            case 'today':
                return $this->getDailyRevenue();
            case 'this_month':
                return $this->getMonthlyRevenue();
            case 'this_year':
                return $this->getYearlyRevenue();
            default:
                return $this->getDailyRevenue();
        }
    }

    public function getTopTables($limit = 5, $period = 'this_month')
    {
        $query = GameSession::where('status', 'finished')
            ->with('table');

        switch ($period) {
            case 'today':
                $query->whereDate('start_time', Carbon::today());
                break;
            case 'this_month':
                $query->whereYear('start_time', Carbon::now()->year)
                      ->whereMonth('start_time', Carbon::now()->month);
                break;
            case 'this_year':
                $query->whereYear('start_time', Carbon::now()->year);
                break;
        }

        $tableStats = $query->get()
            ->groupBy('table_id')
            ->map(function ($sessions) {
                $table = $sessions->first()->table;
                return [
                    'table_id' => $table->id,
                    'table_name' => $table->name,
                    'total_revenue' => $sessions->sum('total_money') ?? 0,
                    'table_revenue' => $sessions->sum('total_money_table') ?? 0,
                    'food_revenue' => $sessions->sum('total_money_food') ?? 0,
                    'session_count' => $sessions->count(),
                    'avg_revenue_per_session' => $sessions->count() > 0 ? 
                        ($sessions->sum('total_money') ?? 0) / $sessions->count() : 0,
                ];
            })
            ->sortByDesc('total_revenue')
            ->take($limit)
            ->values();

        return $tableStats;
    }
}
