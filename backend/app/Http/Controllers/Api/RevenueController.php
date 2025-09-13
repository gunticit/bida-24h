<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RevenueService;
use App\Models\Order;
use App\Models\TakeawayOrder;
use App\Models\Expense;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RevenueController extends Controller
{
    protected $revenueService;

    public function __construct(RevenueService $revenueService)
    {
        $this->revenueService = $revenueService;
    }

    public function getDailyRevenue(Request $request)
    {
        try {
            $date = $request->get('start_date', Carbon::today()->format('Y-m-d'));
            $revenue = $this->revenueService->getDailyRevenue($date);
            return response()->json($revenue);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tải doanh thu ngày'], 500);
        }
    }

    public function getMonthlyRevenue(Request $request)
    {
        try {
            $year = $request->get('year', Carbon::now()->year);
            $month = $request->get('month', Carbon::now()->month);
            $revenue = $this->revenueService->getMonthlyRevenue($year, $month);
            return response()->json($revenue);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tải doanh thu tháng'], 500);
        }
    }

    public function getYearlyRevenue(Request $request)
    {
        try {
            $year = $request->get('year', Carbon::now()->year);
            $revenue = $this->revenueService->getYearlyRevenue($year);
            return response()->json($revenue);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tải doanh thu năm'], 500);
        }
    }
    
    public function getTopTables(Request $request)
    {
        try {
            $limit = $request->get('limit', 5);
            $period = $request->get('period', 'this_month');
            $topTables = $this->revenueService->getTopTables($limit, $period);

            return response()->json($topTables);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tải thống kê bàn'], 500);
        }
    }

    public function getRevenueChart(Request $request)
    {
        try {
            $period = $request->get('period', 'this_month');
            $type = $request->get('type', 'daily'); // daily, monthly, yearly

            $chartData = [];

            switch ($type) {
                case 'daily':
                    if ($period === 'this_month') {
                        $year = Carbon::now()->year;
                        $month = Carbon::now()->month;
                        $daysInMonth = Carbon::create($year, $month)->daysInMonth;
                        
                        for ($day = 1; $day <= $daysInMonth; $day++) {
                            $date = Carbon::create($year, $month, $day);
                            $dailyRevenue = $this->revenueService->getDailyRevenue($date);
                            $chartData[] = [
                                'date' => $date->format('Y-m-d'),
                                'label' => $date->format('d/m'),
                                'total_revenue' => $dailyRevenue['total_revenue'],
                                'table_revenue' => $dailyRevenue['table_revenue'],
                                'food_revenue' => $dailyRevenue['food_revenue'],
                            ];
                        }
                    }
                    break;

                case 'monthly':
                    if ($period === 'this_year') {
                        $year = Carbon::now()->year;
                        for ($month = 1; $month <= 12; $month++) {
                            $monthlyRevenue = $this->revenueService->getMonthlyRevenue($year, $month);
                            $chartData[] = [
                                'month' => $month,
                                'label' => Carbon::create($year, $month)->format('M'),
                                'total_revenue' => $monthlyRevenue['total_revenue'],
                                'table_revenue' => $monthlyRevenue['table_revenue'],
                                'food_revenue' => $monthlyRevenue['food_revenue'],
                            ];
                        }
                    }
                    break;
            }

            return response()->json($chartData);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tải dữ liệu biểu đồ'], 500);
        }
    }
    

    /**
     * Báo cáo theo ngày với khoảng thời gian tùy chọn
     */

    /**
     * Báo cáo chi tiết chi phí nguồn hàng
     */
    public function getCostOfGoodsBreakdown(Request $request)
    {
        try {
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');

            // Chi tiết từ orders (bàn billiard)
            $orderCosts = DB::table('orders as o')
                ->join('game_sessions as gs', 'o.session_id', '=', 'gs.id')
                ->join('menus as m', 'o.menu_id', '=', 'm.id')
                ->select(
                    'm.name as product_name',
                    'm.category',
                    DB::raw('SUM(o.quantity) as total_quantity'),
                    DB::raw('SUM(o.quantity * COALESCE(m.cost_price, m.price * 0.6)) as total_cost'),
                    DB::raw('AVG(COALESCE(m.cost_price, m.price * 0.6)) as avg_cost_per_unit')
                )
                ->where('gs.status', 'completed');

            if ($startDate) {
                $orderCosts->whereDate('o.created_at', '>=', $startDate);
            }
            if ($endDate) {
                $orderCosts->whereDate('o.created_at', '<=', $endDate);
            }

            $orderCosts = $orderCosts->groupBy('o.menu_id', 'm.name', 'm.category')->get();

            // Chi tiết từ takeaway orders
            $takeawayCosts = DB::table('takeaway_order_items as toi')
                ->join('takeaway_orders as to_table', 'toi.takeaway_order_id', '=', 'to_table.id')
                ->join('menus as m', 'toi.menu_id', '=', 'm.id')
                ->select(
                    'm.name as product_name',
                    'm.category',
                    DB::raw('SUM(toi.quantity) as total_quantity'),
                    DB::raw('SUM(toi.quantity * COALESCE(m.cost_price, m.price * 0.6)) as total_cost'),
                    DB::raw('AVG(COALESCE(m.cost_price, m.price * 0.6)) as avg_cost_per_unit')
                )
                ->where('to_table.status', 'completed');

            if ($startDate) {
                $takeawayCosts->whereDate('to_table.order_date', '>=', $startDate);
            }
            if ($endDate) {
                $takeawayCosts->whereDate('to_table.order_date', '<=', $endDate);
            }

            $takeawayCosts = $takeawayCosts->groupBy('toi.menu_id', 'm.name', 'm.category')->get();

            return response()->json([
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ],
                'order_costs' => $orderCosts,
                'takeaway_costs' => $takeawayCosts,
                'total_order_cost' => $orderCosts->sum('total_cost'),
                'total_takeaway_cost' => $takeawayCosts->sum('total_cost'),
                'grand_total' => $orderCosts->sum('total_cost') + $takeawayCosts->sum('total_cost')
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tải chi tiết chi phí nguồn hàng'], 500);
        }
    }
}
