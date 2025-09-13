<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Expense::with('user')->latest('expense_date');

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->byDateRange($request->start_date, $request->end_date);
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $expenses = $query->paginate($request->get('per_page', 15));

        return response()->json($expenses);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'expense_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:1000',
            'category' => 'nullable|string|max:100',
        ]);

        $expense = Expense::create([
            'expense_date' => $request->expense_date,
            'amount' => $request->amount,
            'description' => $request->description,
            'category' => $request->category,
            'user_id' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'Tạo chi phí thành công',
            'data' => $expense->load('user')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $expense = Expense::with('user')->findOrFail($id);
        return response()->json($expense);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $expense = Expense::findOrFail($id);

        $request->validate([
            'expense_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:1000',
            'category' => 'nullable|string|max:100',
        ]);

        $expense->update($request->only([
            'expense_date', 'amount', 'description', 'category'
        ]));

        return response()->json([
            'message' => 'Cập nhật chi phí thành công',
            'data' => $expense->load('user')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();

        return response()->json([
            'message' => 'Xóa chi phí thành công'
        ]);
    }

    /**
     * Get expenses summary by date range
     */
    public function summary(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = $request->start_date;
        $endDate = $request->end_date;

        // Tính tổng trong khoảng thời gian được chọn
        $totalInRange = Expense::byDateRange($startDate, $endDate)->sum('amount');

        // Tính tổng hôm nay
        $today = now()->toDateString();
        $todayTotal = Expense::byDateRange($today, $today)->sum('amount');

        // Tính tổng tháng này
        $thisMonthStart = now()->startOfMonth()->toDateString();
        $thisMonthEnd = now()->endOfMonth()->toDateString();
        $thisMonthTotal = Expense::byDateRange($thisMonthStart, $thisMonthEnd)->sum('amount');

        // Tính tổng năm này
        $thisYearStart = now()->startOfYear()->toDateString();
        $thisYearEnd = now()->endOfYear()->toDateString();
        $thisYearTotal = Expense::byDateRange($thisYearStart, $thisYearEnd)->sum('amount');

        // Tính theo danh mục trong khoảng thời gian được chọn
        $expensesByCategory = Expense::byDateRange($startDate, $endDate)
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->get()
            ->pluck('total', 'category')
            ->toArray();

        return response()->json([
            'total' => $totalInRange,
            'today' => $todayTotal,
            'this_month' => $thisMonthTotal,
            'this_year' => $thisYearTotal,
            'by_category' => $expensesByCategory,
        ]);
    }
}
