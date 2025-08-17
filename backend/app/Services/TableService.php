<?php

namespace App\Services;

use App\Models\Table;

class TableService
{
    public function getAll()
    {
        return Table::all();
    }

    public function getById($id)
    {
        return Table::findOrFail($id);
    }

    public function create(array $data)
    {
        return Table::create($data);
    }

    public function update($id, array $data)
    {
        $table = Table::findOrFail($id);
        $table->update($data);
        return $table;
    }

    public function delete($id)
    {
        $table = Table::findOrFail($id);
        $table->delete();
        return true;
    }
}
