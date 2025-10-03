<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TakeawayOrder;
use App\Models\TakeawayOrderItem;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Api\Traits\ExcelReportTrait;

class DineInOrderController extends Controller
{
    use ExcelReportTrait;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $orders = TakeawayOrder::with(['items.menu'])
            ->where('type', 'dine-in')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($orders);
    }

    /**
     * Get today's dine-in orders
     */
    public function todayOrders()
    {
        $orders = TakeawayOrder::with(['items.menu'])
            ->where('type', 'dine-in')
            ->whereDate('order_date', today())
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

            // Tạo đơn hàng dine-in
            $order = TakeawayOrder::create([
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'notes' => $request->notes,
                'status' => $request->status ?? 'pending',
                'order_date' => now(),
                'total_amount' => 0,
                'type' => 'dine-in', // Đánh dấu là đơn hàng tại chỗ
            ]);

            $totalAmount = 0;

            // Thêm các item vào đơn hàng
            foreach ($request->items as $item) {
                $menu = Menu::find($item['menu_id']);
                
                // Chỉ kiểm tra với menu không phải takeaway
                if ($menu->category === 'takeaway') {
                    throw new \Exception("Sản phẩm {$menu->name} không có trong menu tại chỗ");
                }

                // Kiểm tra số lượng có sẵn
                if ($menu->quantity < $item['quantity']) {
                    throw new \Exception("Sản phẩm {$menu->name} chỉ còn {$menu->quantity} trong kho");
                }

                $itemTotal = $menu->price * $item['quantity'];
                $totalAmount += $itemTotal;

                // Tạo order item
                TakeawayOrderItem::create([
                    'takeaway_order_id' => $order->id,
                    'menu_id' => $item['menu_id'],
                    'quantity' => $item['quantity'],
                    'price' => $menu->price,
                    'total' => $itemTotal,
                ]);

                // Giảm số lượng trong kho
                $menu->decrement('quantity', $item['quantity']);
            }

            // Cập nhật tổng tiền
            $order->update(['total_amount' => $totalAmount]);

            DB::commit();

            // Load lại order với relationships
            $order->load(['items.menu']);

            return response()->json($order, 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $order = TakeawayOrder::with(['items.menu'])
            ->where('type', 'dine-in')
            ->findOrFail($id);

        return response()->json($order);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $order = TakeawayOrder::where('type', 'dine-in')->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'string|in:pending,preparing,ready,completed,cancelled',
            'customer_name' => 'string|max:255',
            'customer_phone' => 'string|max:20',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order->update($request->only(['status', 'customer_name', 'customer_phone', 'notes']));

        return response()->json($order);
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
                ->where('type', 'dine-in')
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
            // Get report data
            $reportRequest = new Request(['from' => $fromDate, 'to' => $toDate]);
            $reportResponse = $this->report($reportRequest);
            $reportData = json_decode($reportResponse->getContent(), true);

            // Create temporary file
            $tempFilePath = tempnam(sys_get_temp_dir(), 'dinein_report_') . '.xlsx';
            $this->createDineInExcelFile($reportData, $tempFilePath);

            $filename = "do-an-tai-cho-tu-{$fromDate}-{$toDate}.xlsx";

            return response()->download($tempFilePath, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ])->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $order = TakeawayOrder::where('type', 'dine-in')->findOrFail($id);

        try {
            DB::beginTransaction();

            // Hoàn lại số lượng sản phẩm nếu đơn hàng chưa hoàn thành
            if (!in_array($order->status, ['completed', 'cancelled'])) {
                foreach ($order->items as $item) {
                    $item->menu->increment('quantity', $item->quantity);
                }
            }

            // Xóa đơn hàng
            $order->delete();

            DB::commit();

            return response()->json(['message' => 'Đơn hàng đã được xóa thành công']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Generate dine-in report file and return download URL
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
            // Generate unique filename
            $timestamp = now()->format('Y-m-d-H-i-s');
            $filename = "bao-cao-dine-in-{$fromDate}-{$toDate}-{$timestamp}.xlsx";
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
            $this->createDineInExcelFile($reportData, $filePath);
            
            // Generate download URL
            $downloadUrl = url("storage/reports/{$filename}");
            
            return response()->json([
                'download_url' => $downloadUrl,
                'message' => 'Báo cáo dine-in đã được tạo thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
