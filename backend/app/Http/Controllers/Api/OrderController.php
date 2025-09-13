<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    protected $service;

    public function __construct(OrderService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return response()->json($this->service->getAll());
    }

    public function store(Request $request)
    {
        // Validate request
        $request->validate([
            'menu_id' => 'required|exists:menus,id',
            'quantity' => 'required|integer|min:1',
            'session_id' => 'required|exists:game_sessions,id',
        ]);

        try {
            $result = $this->service->create($request->all());
            return response()->json($result, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function show($id)
    {
        $order = $this->service->getById($id);
        return response()->json($order);
    }

    public function update(Request $request, $id)
    {
        $order = $this->service->update($id, $request->all());
        return response()->json($order);
    }

    public function destroy($id)
    {
        try {
            $result = $this->service->delete($id);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
