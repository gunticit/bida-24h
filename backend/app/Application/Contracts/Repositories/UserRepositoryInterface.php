<?php

namespace App\Application\Contracts\Repositories;

use App\Domain\Entities\User\User;
use App\Domain\ValueObjects\Email;

interface UserRepositoryInterface
{
    public function findById(int $id): ?User;
    
    public function findByEmail(Email $email): ?User;
    
    public function save(User $user): void;
    
    public function delete(int $id): void;
    
    public function findAll(): array;
    
    public function findByRole(string $role): array;
    
    public function exists(Email $email): bool;
}