<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TableService;
use Illuminate\Http\Request;

class TableController extends Controller
{
    protected $service;

    public function __construct(TableService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return response()->json($this->service->getAll());
    }

    public function store(Request $request)
    {
        $table = $this->service->create($request->all());
        return response()->json($table, 201);
    }

    public function show($id)
    {
        $table = $this->service->getById($id);
        return response()->json($table);
    }

    public function update(Request $request, $id)
    {
        $table = $this->service->update($id, $request->all());
        return response()->json($table);
    }

    public function destroy($id)
    {
        $this->service->delete($id);
        return response()->json(['message' => 'Table deleted']);
    }
}
