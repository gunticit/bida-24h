<?php

namespace App\Domain\Entities\User;

use App\Domain\Enums\UserRole;
use App\Domain\ValueObjects\Email;

final class User
{
    public function __construct(
        private readonly int $id,
        private string $name,
        private Email $email,
        private string $hashedPassword,
        private UserRole $role,
        private readonly \DateTimeImmutable $createdAt,
        private \DateTimeImmutable $updatedAt
    ) {}

    public function getId(): int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getEmail(): Email
    {
        return $this->email;
    }

    public function getHashedPassword(): string
    {
        return $this->hashedPassword;
    }

    public function getRole(): UserRole
    {
        return $this->role;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function updateName(string $name): void
    {
        if (empty(trim($name))) {
            throw new \InvalidArgumentException("Name cannot be empty");
        }

        $this->name = $name;
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function updateEmail(Email $email): void
    {
        $this->email = $email;
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function changePassword(string $hashedPassword): void
    {
        if (empty($hashedPassword)) {
            throw new \InvalidArgumentException("Password cannot be empty");
        }

        $this->hashedPassword = $hashedPassword;
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function changeRole(UserRole $role): void
    {
        $this->role = $role;
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN;
    }

    public function isStaff(): bool
    {
        return $this->role === UserRole::STAFF;
    }

    public function isCustomer(): bool
    {
        return $this->role === UserRole::CUSTOMER;
    }

    public function hasPermissionToManageTables(): bool
    {
        return $this->isAdmin() || $this->isStaff();
    }

    public function hasPermissionToViewReports(): bool
    {
        return $this->isAdmin();
    }
}