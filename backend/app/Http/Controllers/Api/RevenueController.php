<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RevenueService;
use Illuminate\Http\Request;
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
            $date = $request->get('date', Carbon::today()->format('Y-m-d'));
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

    public function getRevenueSummary(Request $request)
    {
        try {
            $period = $request->get('period', 'today');
            $revenue = $this->revenueService->getRevenueSummary($period);
            return response()->json($revenue);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể tải tóm tắt doanh thu'], 500);
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
}
