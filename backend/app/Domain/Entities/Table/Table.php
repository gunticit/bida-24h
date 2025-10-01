<?php

namespace App\Domain\Entities\Table;

use App\Domain\Enums\TableStatus;
use App\Domain\ValueObjects\Money;

final class Table
{
    public function __construct(
        private readonly int $id,
        private string $name,
        private TableStatus $status,
        private Money $pricePerHour,
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

    public function getStatus(): TableStatus
    {
        return $this->status;
    }

    public function getPricePerHour(): Money
    {
        return $this->pricePerHour;
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
            throw new \InvalidArgumentException("Table name cannot be empty");
        }

        $this->name = $name;
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function updatePricePerHour(Money $pricePerHour): void
    {
        $this->pricePerHour = $pricePerHour;
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function startSession(): void
    {
        if (!$this->isAvailable()) {
            throw new \DomainException("Cannot start session on table that is not available");
        }

        $this->status = TableStatus::PLAYING;
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function endSession(): void
    {
        if (!$this->isPlaying()) {
            throw new \DomainException("Cannot end session on table that is not playing");
        }

        $this->status = TableStatus::AVAILABLE;
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function setMaintenance(): void
    {
        if ($this->isPlaying()) {
            throw new \DomainException("Cannot set maintenance on table that is currently playing");
        }

        $this->status = TableStatus::MAINTENANCE;
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function setAvailable(): void
    {
        $this->status = TableStatus::AVAILABLE;
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function isAvailable(): bool
    {
        return $this->status === TableStatus::AVAILABLE;
    }

    public function isPlaying(): bool
    {
        return $this->status === TableStatus::PLAYING;
    }

    public function isInMaintenance(): bool
    {
        return $this->status === TableStatus::MAINTENANCE;
    }

    public function canStartSession(): bool
    {
        return $this->isAvailable();
    }
}