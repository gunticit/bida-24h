<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GameSession;
use App\Models\Order;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class SessionReportController extends Controller
{
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
                    'total_hours' => $tableSessions->sum('total_time') / 60, // Convert to hours
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
            // Get report data (reuse logic from report method)
            $reportRequest = new Request(['from' => $fromDate, 'to' => $toDate]);
            $reportResponse = $this->report($reportRequest);
            $reportData = json_decode($reportResponse->getContent(), true);

            // Create Excel content using simple HTML table format
            $filename = "bao-cao-gio-choi-tu-{$fromDate}-{$toDate}.xlsx";
            
            // Simple Excel export using HTML table
            $html = $this->generateExcelHtml($reportData);
            
            return response($html, 200, [
                'Content-Type' => 'application/vnd.ms-excel',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Cache-Control' => 'max-age=0',
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Generate Excel HTML content
     */
    private function generateExcelHtml($reportData)
    {
        $fromDate = Carbon::parse($reportData['from_date'])->format('d/m/Y');
        $toDate = Carbon::parse($reportData['to_date'])->format('d/m/Y');

        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Báo cáo Giờ chơi</title>
            <style>
                body { font-family: Arial, sans-serif; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .summary { background-color: #e8f4fd; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .header { text-align: center; margin-bottom: 20px; }
                .total-row { background-color: #d4edda; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>BÁO CÁO GIỜ CHƠI BILLIARD</h2>
                <p><strong>Khoảng thời gian:</strong> ' . $fromDate . ' - ' . $toDate . '</p>
                <p><strong>Ngày xuất báo cáo:</strong> ' . date('d/m/Y H:i:s') . '</p>
            </div>

            <h3>TỔNG QUAN</h3>
            <table>
                <tr class="summary">
                    <td><strong>Tổng số sessions</strong></td>
                    <td class="text-right">' . number_format($reportData['total_sessions']) . '</td>
                </tr>
                <tr class="summary">
                    <td><strong>Tổng doanh thu</strong></td>
                    <td class="text-right">' . number_format($reportData['total_revenue'], 0, ',', '.') . ' đ</td>
                </tr>
                <tr class="summary">
                    <td><strong>Doanh thu từ bàn</strong></td>
                    <td class="text-right">' . number_format($reportData['total_table_revenue'], 0, ',', '.') . ' đ</td>
                </tr>
                <tr class="summary">
                    <td><strong>Doanh thu từ đồ ăn/uống</strong></td>
                    <td class="text-right">' . number_format($reportData['total_food_revenue'], 0, ',', '.') . ' đ</td>
                </tr>
                <tr class="summary">
                    <td><strong>Tổng thời gian chơi</strong></td>
                    <td class="text-right">' . number_format($reportData['summary']['total_play_hours'], 1) . ' giờ</td>
                </tr>
                <tr class="summary">
                    <td><strong>Thời gian trung bình/session</strong></td>
                    <td class="text-right">' . number_format($reportData['summary']['avg_session_duration'], 1) . ' phút</td>
                </tr>
                <tr class="summary">
                    <td><strong>Doanh thu trung bình/session</strong></td>
                    <td class="text-right">' . number_format($reportData['summary']['avg_revenue_per_session'], 0, ',', '.') . ' đ</td>
                </tr>
            </table>

            <h3>THỐNG KÊ THEO BÀN</h3>
            <table>
                <thead>
                    <tr>
                        <th>Tên bàn</th>
                        <th>Số sessions</th>
                        <th>Tổng giờ chơi</th>
                        <th>Doanh thu bàn</th>
                        <th>Doanh thu đồ ăn</th>
                        <th>Tổng doanh thu</th>
                    </tr>
                </thead>
                <tbody>';

        foreach ($reportData['table_stats'] as $table) {
            $html .= '
                    <tr>
                        <td>' . htmlspecialchars($table['table_name']) . '</td>
                        <td class="text-center">' . number_format($table['sessions_count']) . '</td>
                        <td class="text-right">' . number_format($table['total_hours'], 1) . ' giờ</td>
                        <td class="text-right">' . number_format($table['table_revenue'], 0, ',', '.') . ' đ</td>
                        <td class="text-right">' . number_format($table['food_revenue'], 0, ',', '.') . ' đ</td>
                        <td class="text-right">' . number_format($table['total_revenue'], 0, ',', '.') . ' đ</td>
                    </tr>';
        }

        $html .= '
                </tbody>
            </table>';

        if (!empty($reportData['food_stats'])) {
            $html .= '
            <h3>THỐNG KÊ ĐỒ ĂN/UỐNG (CHỈ TRONG GIỜ CHƠI)</h3>
            <table>
                <thead>
                    <tr>
                        <th>Tên món</th>
                        <th>Loại</th>
                        <th>Số lượng bán</th>
                        <th>Đơn giá</th>
                        <th>Tổng tiền</th>
                    </tr>
                </thead>
                <tbody>';

            foreach ($reportData['food_stats'] as $food) {
                $categoryText = $food['category'] == 'food' ? 'Đồ ăn' : ($food['category'] == 'drink' ? 'Đồ uống' : 'Thuốc lá');
                $html .= '
                    <tr>
                        <td>' . htmlspecialchars($food['menu_name']) . '</td>
                        <td>' . $categoryText . '</td>
                        <td class="text-center">' . number_format($food['total_quantity']) . '</td>
                        <td class="text-right">' . number_format($food['unit_price'], 0, ',', '.') . ' đ</td>
                        <td class="text-right">' . number_format($food['total_amount'], 0, ',', '.') . ' đ</td>
                    </tr>';
            }

            $html .= '
                    <tr class="total-row">
                        <td colspan="2"><strong>TỔNG CỘNG</strong></td>
                        <td class="text-center"><strong>' . number_format($reportData['summary']['total_food_items_sold']) . '</strong></td>
                        <td></td>
                        <td class="text-right"><strong>' . number_format($reportData['total_food_revenue'], 0, ',', '.') . ' đ</strong></td>
                    </tr>
                </tbody>
            </table>';
        }

        $html .= '
        </body>
        </html>';

        return $html;
    }
}