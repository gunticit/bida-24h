<?php

namespace App\Application\Contracts\Repositories;

use App\Domain\Entities\Table\Table;
use App\Domain\Enums\TableStatus;

interface TableRepositoryInterface
{
    public function findById(int $id): ?Table;
    
    public function save(Table $table): void;
    
    public function delete(int $id): void;
    
    public function findAll(): array;
    
    public function findByStatus(TableStatus $status): array;
    
    public function findAvailable(): array;
    
    public function findPlaying(): array;
    
    public function exists(int $id): bool;
}