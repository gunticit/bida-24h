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
}
