<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TakeawayOrder;
use App\Models\TakeawayOrderItem;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TakeawayOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $orders = TakeawayOrder::with(['items.menu'])
            ->where('type', 'takeaway')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'string|max:255',
            'customer_phone' => 'string|max:20',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.menu_id' => 'required|exists:menus,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // Tạo đơn hàng
            $order = TakeawayOrder::create([
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'notes' => $request->notes,
                'total_amount' => 0, // Sẽ update sau
                'order_date' => now(),
                'status' => $request->status ?? 'pending', // Mặc định là 'pending' nếu không có giá trị nào được gửi lên
                'type' => 'takeaway', // Đánh dấu là đơn hàng mang về
            ]);

            $totalAmount = 0;

            // Kiểm tra số lượng sản phẩm trước khi tạo đơn hàng
            foreach ($request->items as $item) {
                $menu = Menu::findOrFail($item['menu_id']);
                
                // Chỉ cho phép menu category = 'takeaway'
                if ($menu->category !== 'takeaway') {
                    throw new \Exception("Menu item {$menu->name} is not available for takeaway");
                }

                // Kiểm tra số lượng có đủ không
                if ($menu->quantity < $item['quantity']) {
                    throw new \Exception("Không đủ số lượng sản phẩm {$menu->name}. Số lượng hiện tại: {$menu->quantity}, số lượng yêu cầu: {$item['quantity']}");
                }
            }

            // Nếu tất cả sản phẩm đều đủ số lượng, tiến hành tạo đơn hàng và trừ số lượng
            foreach ($request->items as $item) {
                $menu = Menu::findOrFail($item['menu_id']);
                
                // Trừ số lượng sản phẩm
                $menu->decrement('quantity', $item['quantity']);

                $orderItem = TakeawayOrderItem::create([
                    'takeaway_order_id' => $order->id,
                    'menu_id' => $item['menu_id'],
                    'quantity' => $item['quantity'],
                    'price' => $menu->price,
                ]);

                $totalAmount += $orderItem->total;
            }

            // Update tổng tiền
            $order->update(['total_amount' => $totalAmount]);

            DB::commit();

            // Load lại order với relations
            $order->load(['items.menu']);

            return response()->json($order, 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $order = TakeawayOrder::with(['items.menu'])
            ->where('type', 'takeaway')
            ->findOrFail($id);
        return response()->json($order);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $order = TakeawayOrder::where('type', 'takeaway')->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:pending,preparing,ready,completed,cancelled',
            'notes' => 'sometimes|string|nullable',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // Nếu chuyển sang trạng thái cancelled, hoàn trả số lượng sản phẩm
            if (isset($request->status) && $request->status === 'cancelled' && $order->status !== 'cancelled') {
                foreach ($order->items as $item) {
                    $menu = Menu::findOrFail($item->menu_id);
                    $menu->increment('quantity', $item->quantity);
                }
            }

            $order->update($request->only(['status', 'notes']));

            DB::commit();

            return response()->json($order);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $order = TakeawayOrder::with(['items.menu'])
            ->where('type', 'takeaway')
            ->findOrFail($id);
        
        // Chỉ cho phép xóa nếu status là pending hoặc cancelled
        if (!in_array($order->status, ['pending', 'cancelled'])) {
            return response()->json(['error' => 'Cannot delete order in current status'], 400);
        }

        try {
            DB::beginTransaction();

            // Hoàn trả số lượng sản phẩm về menu
            foreach ($order->items as $item) {
                $menu = Menu::findOrFail($item->menu_id);
                $menu->increment('quantity', $item->quantity);
            }

            // Xóa đơn hàng
            $order->delete();

            DB::commit();

            return response()->json(['message' => 'Order deleted successfully and inventory restored']);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get today's takeaway orders
     */
    public function todayOrders()
    {
        $orders = TakeawayOrder::with(['items.menu'])
            ->where('type', 'takeaway')
            ->whereDate('order_date', today())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    /**
     * Get takeaway report data for date range
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
            // Get orders in date range
            $orders = TakeawayOrder::with(['items.menu'])
                ->where('type', 'takeaway')
                ->whereBetween('order_date', [$fromDate, $toDate])
                ->get();

            // Calculate summary data
            $totalOrders = $orders->count();
            $totalAmount = $orders->sum('total_amount');

            // Group items by menu and calculate totals
            $itemsData = [];
            $totalItemsSold = 0;

            foreach ($orders as $order) {
                foreach ($order->items as $item) {
                    $menuName = $item->menu ? $item->menu->name : 'Unknown Menu';
                    $menuId = $item->menu_id;
                    
                    if (!isset($itemsData[$menuId])) {
                        $itemsData[$menuId] = [
                            'menu_name' => $menuName,
                            'total_quantity' => 0,
                            'unit_price' => $item->price,
                            'total_amount' => 0,
                        ];
                    }
                    
                    $itemsData[$menuId]['total_quantity'] += $item->quantity;
                    $itemsData[$menuId]['total_amount'] += $item->total;
                    $totalItemsSold += $item->quantity;
                }
            }

            // Convert to array and sort by total quantity desc
            $items = array_values($itemsData);
            usort($items, function($a, $b) {
                return $b['total_quantity'] <=> $a['total_quantity'];
            });

            $averageOrderValue = $totalOrders > 0 ? $totalAmount / $totalOrders : 0;

            $reportData = [
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'total_orders' => $totalOrders,
                'total_amount' => $totalAmount,
                'items' => $items,
                'summary' => [
                    'total_items_sold' => $totalItemsSold,
                    'average_order_value' => round($averageOrderValue, 2),
                ]
            ];

            return response()->json($reportData);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Download takeaway report as Excel file
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
            $filename = "takeaway-report-{$fromDate}-{$toDate}.xlsx";
            
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
     * Generate HTML for Excel export
     */
    private function generateExcelHtml($reportData)
    {
        $html = '
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
            </style>
        </head>
        <body>
            <h2>BÁO CÁO TAKEAWAY</h2>
            <p><strong>Từ ngày:</strong> ' . $reportData['from_date'] . '</p>
            <p><strong>Đến ngày:</strong> ' . $reportData['to_date'] . '</p>
            <p><strong>Tổng đơn hàng:</strong> ' . $reportData['total_orders'] . '</p>
            <p><strong>Tổng doanh thu:</strong> ' . number_format($reportData['total_amount'], 0, ',', '.') . ' VND</p>
            <p><strong>Tổng sản phẩm bán:</strong> ' . $reportData['summary']['total_items_sold'] . '</p>
            <br>
            <table>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên sản phẩm</th>
                        <th class="text-center">Số lượng bán</th>
                        <th class="text-right">Đơn giá</th>
                        <th class="text-right">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>';
                
        foreach ($reportData['items'] as $index => $item) {
            $html .= '
                    <tr>
                        <td class="text-center">' . ($index + 1) . '</td>
                        <td>' . htmlspecialchars($item['menu_name']) . '</td>
                        <td class="text-center">' . $item['total_quantity'] . '</td>
                        <td class="text-right">' . number_format($item['unit_price'], 0, ',', '.') . '</td>
                        <td class="text-right">' . number_format($item['total_amount'], 0, ',', '.') . '</td>
                    </tr>';
        }
        
        $html .= '
                    <tr style="background-color: #e3f2fd; font-weight: bold;">
                        <td colspan="2" class="text-center">TỔNG CỘNG</td>
                        <td class="text-center">' . $reportData['summary']['total_items_sold'] . '</td>
                        <td></td>
                        <td class="text-right">' . number_format($reportData['total_amount'], 0, ',', '.') . '</td>
                    </tr>
                </tbody>
            </table>
        </body>
        </html>';
        
        return $html;
    }
}
