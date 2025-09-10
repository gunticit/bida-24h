<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MenuService;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    protected $service;

    public function __construct(MenuService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return response()->json($this->service->getAll());
    }

    public function available()
    {
        return response()->json($this->service->getAvailable());
    }

    public function store(Request $request)
    {
        $menu = $this->service->create($request->all());
        return response()->json($menu, 201);
    }

    public function show($id)
    {
        $menu = $this->service->getById($id);
        return response()->json($menu);
    }

    public function update(Request $request, $id)
    {
        $menu = $this->service->update($id, $request->all());
        return response()->json($menu);
    }

    public function destroy($id)
    {
        $this->service->delete($id);
        return response()->json(['message' => 'Menu deleted']);
    }

    public function updateQuantity(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:0'
        ]);

        $menu = $this->service->updateQuantity($id, $request->quantity);
        return response()->json($menu);
    }

    public function decreaseQuantity(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|integer|min:1'
        ]);

        $success = $this->service->decreaseQuantity($id, $request->amount);
        if ($success) {
            $menu = $this->service->getById($id);
            return response()->json($menu);
        }
        
        return response()->json(['error' => 'Không đủ số lượng tồn kho'], 400);
    }

    public function increaseQuantity(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|integer|min:1'
        ]);

        $this->service->increaseQuantity($id, $request->amount);
        $menu = $this->service->getById($id);
        return response()->json($menu);
    }
}
