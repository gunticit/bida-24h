<?php

namespace App\Services;

use App\Models\GameSession;
use App\Models\TakeawayOrder;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

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
            ->where('type', 'takeaway')
            ->whereIn('status', ['completed'])
            ->sum('total_amount') ?? 0;

        // Tính dine-in revenue từ bảng takeaway_orders mới
        $dineinRevenue = TakeawayOrder::whereDate('order_date', $date)
            ->where('type', 'dine-in')
            ->whereIn('status', ['completed'])
            ->sum('total_amount') ?? 0;
            
        // Tính chi phí trong ngày
        $totalExpenses = Expense::whereDate('expense_date', $date)->sum('amount') ?? 0;
        
        // Tính chi phí nguồn hàng (COGS) trong ngày
        $dateStr = $date->format('Y-m-d');
        $totalCogs = $this->calculateCostOfGoodsSold($dateStr, $dateStr);
        
        $totalRevenue = ($sessions->sum('total_money') ?? 0) + $takeawayRevenue + $dineinRevenue;
        $profit = $totalRevenue - $totalCogs - $totalExpenses;
        $sessionCount = $sessions->count();

        return [
            'date' => $date->format('Y-m-d'),
            'total_revenue' => $totalRevenue,
            'total_expenses' => $totalExpenses,
            'total_cost_of_goods_sold' => $totalCogs,
            'total_profit' => $profit,
            'profit_margin' => $totalRevenue > 0 ? ($profit / $totalRevenue) * 100 : 0,
            'table_revenue' => $totalTableRevenue,
            'food_revenue' => $totalFoodRevenue,
            'takeaway_revenue' => $takeawayRevenue,
            'dinein_revenue' => $dineinRevenue ?? 0,
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

    public function getDailyRevenueRange($startDate = null, $endDate = null)
    {
        $startDate = $startDate ? Carbon::parse($startDate) : Carbon::now()->startOfMonth();
        $endDate = $endDate ? Carbon::parse($endDate) : Carbon::now();

        $dailyData = [];
        $current = $startDate->copy();

        while ($current->lte($endDate)) {
            $dateStr = $current->format('Y-m-d');
            
            $revenue = $this->calculateRevenue($dateStr, $dateStr);
            $cogs = $this->calculateCostOfGoodsSold($dateStr, $dateStr);
            $expenses = $this->calculateExpenses($dateStr, $dateStr);
            $profit = $revenue - $cogs - $expenses;

            $dailyData[] = [
                'date' => $dateStr,
                'revenue' => $revenue,
                'cost_of_goods_sold' => $cogs,
                'expenses' => $expenses,
                'profit' => $profit,
                'profit_margin' => $revenue > 0 ? ($profit / $revenue) * 100 : 0
            ];

            $current->addDay();
        }

        return [
            'period' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d')
            ],
            'daily_data' => $dailyData,
            'summary' => [
                'total_revenue' => array_sum(array_column($dailyData, 'revenue')),
                'total_cost_of_goods_sold' => array_sum(array_column($dailyData, 'cost_of_goods_sold')),
                'total_expenses' => array_sum(array_column($dailyData, 'expenses')),
                'total_profit' => array_sum(array_column($dailyData, 'profit'))
            ]
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
            ->where('type', 'takeaway')
            ->whereIn('status', ['completed'])
            ->sum('total_amount') ?? 0;

        // Tính dine-in revenue cho tháng từ bảng takeaway_orders
        $dineinRevenue = TakeawayOrder::whereYear('order_date', $year)
            ->whereMonth('order_date', $month)
            ->where('type', 'dine-in')
            ->whereIn('status', ['completed'])
            ->sum('total_amount') ?? 0;

        $totalRevenue = ($sessions->sum('total_money') ?? 0) + $takeawayRevenue + $dineinRevenue;
        $sessionCount = $sessions->count();

        // Tính tổng chi phí theo tháng
        $totalExpenses = Expense::whereYear('expense_date', $year)
            ->whereMonth('expense_date', $month)
            ->sum('amount') ?? 0;
        
        // Tính chi phí nguồn hàng cho tháng
        $startOfMonth = Carbon::create($year, $month, 1)->format('Y-m');
        $endOfMonth = Carbon::create($year, $month, 1)->endOfMonth()->format('Y-m');
        $totalCogs = $this->calculateCostOfGoodsSold($startOfMonth, $endOfMonth, 'monthly');
        
        $profit = $totalRevenue - $totalCogs - $totalExpenses;

        // Batch pre-fetch takeaway, dine-in, expenses for all days in the month (avoid N+1)
        $startOfMonth = Carbon::create($year, $month, 1)->format('Y-m-d');
        $endOfMonthDate = Carbon::create($year, $month, 1)->endOfMonth()->format('Y-m-d');

        $takeawayByDay = TakeawayOrder::whereBetween('order_date', [$startOfMonth, $endOfMonthDate])
            ->where('type', 'takeaway')
            ->whereIn('status', ['completed'])
            ->selectRaw('DATE(order_date) as day, SUM(total_amount) as total')
            ->groupByRaw('DATE(order_date)')
            ->pluck('total', 'day');

        $dineinByDay = TakeawayOrder::whereBetween('order_date', [$startOfMonth, $endOfMonthDate])
            ->where('type', 'dine-in')
            ->whereIn('status', ['completed'])
            ->selectRaw('DATE(order_date) as day, SUM(total_amount) as total')
            ->groupByRaw('DATE(order_date)')
            ->pluck('total', 'day');

        $expensesByDay = Expense::whereBetween('expense_date', [$startOfMonth, $endOfMonthDate])
            ->selectRaw('DATE(expense_date) as day, SUM(amount) as total')
            ->groupByRaw('DATE(expense_date)')
            ->pluck('total', 'day');

        // Tính doanh thu theo ngày trong tháng
        $dailyBreakdown = $sessions->groupBy(function ($session) {
            return $session->start_time->format('Y-m-d');
        })->map(function ($daySessions) use ($takeawayByDay, $dineinByDay, $expensesByDay) {
            $date = $daySessions->first()->start_time->format('Y-m-d');
            
            $dayTakeaway = $takeawayByDay[$date] ?? 0;
            $dayDinein = $dineinByDay[$date] ?? 0;
            $dayExpenses = $expensesByDay[$date] ?? 0;

            $dayRevenue = ($daySessions->sum('total_money') ?? 0) + $dayTakeaway + $dayDinein;

            return [
                'date' => $date,
                'total_revenue' => $dayRevenue,
                'table_revenue' => $daySessions->sum('total_money_table') ?? 0,
                'food_revenue' => $daySessions->sum('total_money_food') ?? 0,
                'takeaway_revenue' => $dayTakeaway,
                'dinein_revenue' => $dayDinein,
                'total_expenses' => $dayExpenses,
                'total_cost_of_goods_sold' => 0,
                'total_profit' => $dayRevenue - $dayExpenses,
                'session_count' => $daySessions->count(),
            ];
        })->values();

        return [
            'year' => $year,
            'month' => $month,
            'month_name' => Carbon::create($year, $month)->format('m-Y'),
            'total_revenue' => $totalRevenue,
            'table_revenue' => $totalTableRevenue,
            'food_revenue' => $totalFoodRevenue,
            'takeaway_revenue' => $takeawayRevenue,
            'dinein_revenue' => $dineinRevenue ?? 0,
            'total_expenses' => $totalExpenses,
            'total_cost_of_goods_sold' => $totalCogs,
            'total_profit' => $profit,
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
            ->where('type', 'takeaway')
            ->whereIn('status', ['completed'])
            ->sum('total_amount') ?? 0;

        // Tính dine-in revenue cho năm từ bảng takeaway_orders
        $dineinRevenue = TakeawayOrder::whereYear('order_date', $year)
            ->where('type', 'dine-in')
            ->whereIn('status', ['completed'])
            ->sum('total_amount') ?? 0;

        $totalRevenue = ($sessions->sum('total_money') ?? 0) + $takeawayRevenue + $dineinRevenue;
        $sessionCount = $sessions->count();
        
        // Tính tổng chi phí theo năm
        $totalExpenses = Expense::whereYear('expense_date', $year)
            ->sum('amount') ?? 0;
        
        // Tính chi phí nguồn hàng cho năm
        $totalCogs = $this->calculateCostOfGoodsSold($year, $year, 'yearly');

        $profit = $totalRevenue - $totalCogs - $totalExpenses;

        // Batch pre-fetch takeaway, dine-in, expenses for all months in the year (avoid N+1)
        $takeawayByMonth = TakeawayOrder::whereYear('order_date', $year)
            ->where('type', 'takeaway')
            ->whereIn('status', ['completed'])
            ->selectRaw('MONTH(order_date) as m, SUM(total_amount) as total')
            ->groupByRaw('MONTH(order_date)')
            ->pluck('total', 'm');

        $dineinByMonth = TakeawayOrder::whereYear('order_date', $year)
            ->where('type', 'dine-in')
            ->whereIn('status', ['completed'])
            ->selectRaw('MONTH(order_date) as m, SUM(total_amount) as total')
            ->groupByRaw('MONTH(order_date)')
            ->pluck('total', 'm');

        $expensesByMonth = Expense::whereYear('expense_date', $year)
            ->selectRaw('MONTH(expense_date) as m, SUM(amount) as total')
            ->groupByRaw('MONTH(expense_date)')
            ->pluck('total', 'm');

        // Tính doanh thu theo tháng trong năm
        $monthlyBreakdown = $sessions->groupBy(function ($session) {
            return $session->start_time->format('Y-m');
        })->map(function ($monthSessions) use ($takeawayByMonth, $dineinByMonth, $expensesByMonth) {
            $firstSession = $monthSessions->first();
            $month = $firstSession->start_time->month;
            
            $monthTakeaway = $takeawayByMonth[$month] ?? 0;
            $monthDinein = $dineinByMonth[$month] ?? 0;
            $monthExpenses = $expensesByMonth[$month] ?? 0;
                
            $monthRevenue = ($monthSessions->sum('total_money') ?? 0) + $monthTakeaway + $monthDinein;
            
            return [
                'year' => $firstSession->start_time->year,
                'month' => $month,
                'month_name' => $firstSession->start_time->format('m-Y'),
                'total_revenue' => $monthRevenue,
                'table_revenue' => $monthSessions->sum('total_money_table') ?? 0,
                'food_revenue' => $monthSessions->sum('total_money_food') ?? 0,
                'takeaway_revenue' => $monthTakeaway,
                'dinein_revenue' => $monthDinein,
                'total_expenses' => $monthExpenses,
                'total_cost_of_goods_sold' => 0,
                'total_profit' => $monthRevenue - $monthExpenses,
                'session_count' => $monthSessions->count(),
            ];
        })->values();

        return [
            'year' => $year,
            'total_revenue' => $totalRevenue,
            'table_revenue' => $totalTableRevenue,
            'food_revenue' => $totalFoodRevenue,
            'takeaway_revenue' => $takeawayRevenue,
            'dinein_revenue' => $dineinRevenue ?? 0,
            'total_expenses' => $totalExpenses,
            'total_cost_of_goods_sold' => $totalCogs,
            'total_profit' => $profit,
            'session_count' => $sessionCount,
            'monthly_breakdown' => $monthlyBreakdown,
        ];
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
    
    /**
     * Tính chi phí nguồn hàng từ sản phẩm bán ra
     */
    public function calculateCostOfGoodsSold($startDate = null, $endDate = null, $type = 'date')
    {
        $query = "
            SELECT SUM(cost_amount) as total_cost
            FROM (
                -- Chi phí từ orders (bàn billiard)
                SELECT 
                    o.quantity * COALESCE(m.cost_price, m.price * 0.6) as cost_amount
                FROM orders o
                INNER JOIN menus m ON o.menu_id = m.id
                INNER JOIN game_sessions gs ON o.session_id = gs.id
                WHERE gs.status = 'finished'
        ";

        $params = [];
        
        if ($startDate && $type === 'date') {
            $query .= " AND DATE(o.created_at) >= ?";
            $params[] = $startDate;
        }
        
        if ($endDate && $type === 'date') {
            $query .= " AND DATE(o.created_at) <= ?";
            $params[] = $endDate;
        }

        if ($startDate && $type === 'monthly') {
            $query .= " AND YEAR(o.created_at) = ? AND MONTH(o.created_at) = ?";
            $dateParts = explode('-', $startDate);
            $params[] = $dateParts[0];
            $params[] = $dateParts[1];
        }

        if($startDate && $type === 'yearly') {
            $query .= " AND YEAR(o.created_at) = ?";
            $params[] = $startDate;
        }

        $query .= "
                UNION ALL
                -- Chi phí từ takeaway orders
                SELECT 
                    toi.quantity * COALESCE(m.cost_price, m.price * 0.6) as cost_amount
                FROM takeaway_order_items toi
                INNER JOIN takeaway_orders to_table ON toi.takeaway_order_id = to_table.id
                INNER JOIN menus m ON toi.menu_id = m.id
                WHERE to_table.status = 'completed'
        ";

        if ($startDate && $type === 'date') {
            $query .= " AND DATE(to_table.order_date) >= ?";
            $params[] = $startDate;
        }
        
        if ($endDate && $type === 'date') {
            $query .= " AND DATE(to_table.order_date) <= ?";
            $params[] = $endDate;
        }

        if ($startDate && $type === 'monthly') {
            $query .= " AND YEAR(to_table.order_date) = ? AND MONTH(to_table.order_date) = ?";
            $dateParts = explode('-', $startDate);
            $params[] = $dateParts[0];
            $params[] = $dateParts[1];
        }

        if($startDate && $type === 'yearly') {
            $query .= " AND YEAR(to_table.order_date) = ?";
            $params[] = $startDate;
        }

        $query .= ") as cost_calculation";
        $result = DB::select($query, $params);
        return $result[0]->total_cost ?? 0;
    }

    /**
     * Tính doanh thu từ game sessions và takeaway orders
     */
    public function calculateRevenue($startDate = null, $endDate = null)
    {
        // Doanh thu từ game sessions (bàn billiard)
        $sessionRevenue = DB::table('game_sessions')->where('status', 'completed');
        
        // Doanh thu từ takeaway orders
        $takeawayRevenue = TakeawayOrder::where('status', 'completed');

        if ($startDate) {
            $sessionRevenue->whereDate('created_at', '>=', $startDate);
            $takeawayRevenue->whereDate('order_date', '>=', $startDate);
        }

        if ($endDate) {
            $sessionRevenue->whereDate('created_at', '<=', $endDate);
            $takeawayRevenue->whereDate('order_date', '<=', $endDate);
        }

        return $sessionRevenue->sum('total_money') + $takeawayRevenue->sum('total_amount');
    }

    /**
     * Tính chi phí phát sinh
     */
    public function calculateExpenses($startDate = null, $endDate = null)
    {
        $query = Expense::query();

        if ($startDate) {
            $query->whereDate('expense_date', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('expense_date', '<=', $endDate);
        }

        return $query->sum('amount');
    }
}
