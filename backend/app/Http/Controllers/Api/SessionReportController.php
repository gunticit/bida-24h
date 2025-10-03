<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Api\Traits\ExcelReportTrait;
use App\Utils\DateHelper;

class SessionReportController extends Controller
{
    use ExcelReportTrait;
    /**
     * Get playtime sessions report data for date range
     */
    public function report(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $fromDate = $request->input('from');
        $toDate = $request->input('to');

        try {
            // Get sessions in date range
            $sessions = GameSession::with(['table', 'orders.menu'])
                ->whereBetween('start_time', [$fromDate, $toDate])
                ->whereIn('status', ['finished'])
                ->orderBy('start_time', 'desc')
                ->get();

            $totalSessions = $sessions->count();
            $totalRevenue = $sessions->sum('total_money') ?? 0;
            $totalTableRevenue = $sessions->sum('total_money_table') ?? 0;
            $totalFoodRevenue = $sessions->sum('total_money_food') ?? 0;

            // Get table statistics
            $tableStats = $sessions->groupBy('table_id')->map(function ($tableSessions) {
                $table = $tableSessions->first()->table;
                return [
                    'table_name' => $table->name,
                    'sessions_count' => $tableSessions->count(),
                    'total_revenue' => $tableSessions->sum('total_money') ?? 0,
                    'table_revenue' => $tableSessions->sum('total_money_table') ?? 0,
                    'food_revenue' => $tableSessions->sum('total_money_food') ?? 0,
                    'total_hours' => $tableSessions->sum('total_time') ?? 0,
                ];
            })->values();

            // Get food items statistics (only items ordered during sessions, not takeaway/dine-in)
            $foodStats = [];
            foreach ($sessions as $session) {
                foreach ($session->orders as $order) {
                    $menuItem = $order->menu;
                    if ($menuItem && in_array($menuItem->category, ['food', 'drink', 'tobacco'])) { // Exclude takeaway category
                        $key = $order->menu_id;
                        if (!isset($foodStats[$key])) {
                            $foodStats[$key] = [
                                'menu_name' => $menuItem->name,
                                'category' => $menuItem->category,
                                'total_quantity' => 0,
                                'unit_price' => $order->unit_price,
                                'total_amount' => 0,
                            ];
                        }
                        $foodStats[$key]['total_quantity'] += $order->quantity;
                        $foodStats[$key]['total_amount'] += $order->total_price;
                    }
                }
            }

            $foodStats = array_values($foodStats);

            // Sort by total amount descending
            usort($foodStats, function ($a, $b) {
                return $b['total_amount'] <=> $a['total_amount'];
            });

            $tableStatsArray = $tableStats->toArray();
            usort($tableStatsArray, function ($a, $b) {
                return $b['total_revenue'] <=> $a['total_revenue'];
            });

            $totalPlayTime = $sessions->sum('total_time'); // in minutes
            $avgSessionDuration = $totalSessions > 0 ? $totalPlayTime / $totalSessions : 0;
            $avgRevenuePerSession = $totalSessions > 0 ? $totalRevenue / $totalSessions : 0;

            $reportData = [
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'total_sessions' => $totalSessions,
                'total_revenue' => $totalRevenue,
                'total_table_revenue' => $totalTableRevenue,
                'total_food_revenue' => $totalFoodRevenue,
                'total_play_time' => $totalPlayTime, // in minutes
                'table_stats' => $tableStatsArray,
                'food_stats' => $foodStats,
                'summary' => [
                    'avg_session_duration' => round($avgSessionDuration, 2), // in minutes
                    'avg_revenue_per_session' => round($avgRevenuePerSession, 2),
                    'total_play_hours' => round($totalPlayTime / 60, 2),
                    'total_food_items_sold' => array_sum(array_column($foodStats, 'total_quantity')),
                ]
            ];

            return response()->json($reportData);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Download playtime sessions report as Excel file
     */
    public function downloadReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $fromDate = $request->input('from');
        $toDate = $request->input('to');

        try {
            // Get report data
            $reportRequest = new Request(['from' => $fromDate, 'to' => $toDate]);
            $reportResponse = $this->report($reportRequest);
            $reportData = json_decode($reportResponse->getContent(), true);

            // Create temporary file
            $tempFilePath = tempnam(sys_get_temp_dir(), 'session_report_') . '.xlsx';
            $this->createSessionExcelFile($reportData, $tempFilePath);

            // Format dates using DateHelper
            $dateRange = DateHelper::formatDateRangeForFilename($fromDate, $toDate);
            $filename = "Bao-Cao-Gio-Choi-{$dateRange}.xlsx";

            return response()->download($tempFilePath, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ])->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Generate playtime report file and return download URL
     */
    public function generateReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $fromDate = $request->input('from');
        $toDate = $request->input('to');

        try {
            // Generate unique filename using DateHelper
            $timestamp = DateHelper::generateTimestampForFilename();
            $dateRange = DateHelper::formatDateRangeForFilename($fromDate, $toDate);
            $filename = "Bao-Cao-Gio-Choi-{$dateRange}-{$timestamp}.xlsx";
            $filePath = storage_path("app/public/reports/{$filename}");
            
            // Ensure reports directory exists
            $reportsDir = storage_path('app/public/reports');
            if (!file_exists($reportsDir)) {
                mkdir($reportsDir, 0755, true);
            }

            // Get report data
            $reportRequest = new Request(['from' => $fromDate, 'to' => $toDate]);
            $reportResponse = $this->report($reportRequest);

            $reportData = json_decode($reportResponse->getContent(), true);
            
            // Create Excel file using trait method
            $this->createSessionExcelFile($reportData, $filePath);
            
            // Generate download URL
            $downloadUrl = url("storage/reports/{$filename}");
            
            return response()->json([
                'download_url' => $downloadUrl,
                'message' => 'Báo cáo đã được tạo thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}