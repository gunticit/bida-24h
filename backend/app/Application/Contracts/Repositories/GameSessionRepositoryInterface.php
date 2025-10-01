<?php

namespace App\Application\Contracts\Repositories;

use App\Domain\Entities\Session\GameSession;
use App\Domain\Enums\SessionStatus;

interface GameSessionRepositoryInterface
{
    public function findById(int $id): ?GameSession;
    
    public function save(GameSession $session): void;
    
    public function delete(int $id): void;
    
    public function findAll(): array;
    
    public function findByTableId(int $tableId): array;
    
    public function findActiveSessionByTableId(int $tableId): ?GameSession;
    
    public function findByStatus(SessionStatus $status): array;
    
    public function findByDateRange(\DateTimeImmutable $startDate, \DateTimeImmutable $endDate): array;
    
    public function exists(int $id): bool;
}