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
        $order = $this->service->create($request->all());
        return response()->json($order, 201);
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
        $this->service->delete($id);
        return response()->json(['message' => 'Order deleted']);
    }
}
