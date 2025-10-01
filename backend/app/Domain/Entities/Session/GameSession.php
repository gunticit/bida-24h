<?php

namespace App\Domain\Entities\Session;

use App\Domain\Enums\SessionStatus;
use App\Domain\ValueObjects\Money;
use App\Domain\ValueObjects\TimeRange;

final class GameSession
{
    public function __construct(
        private readonly int $id,
        private readonly int $tableId,
        private TimeRange $timeRange,
        private Money $hourPrice,
        private Money $totalMoneyTable,
        private Money $totalMoneyFood,
        private SessionStatus $status,
        private readonly \DateTimeImmutable $createdAt,
        private \DateTimeImmutable $updatedAt
    ) {}

    public function getId(): int
    {
        return $this->id;
    }

    public function getTableId(): int
    {
        return $this->tableId;
    }

    public function getTimeRange(): TimeRange
    {
        return $this->timeRange;
    }

    public function getHourPrice(): Money
    {
        return $this->hourPrice;
    }

    public function getTotalMoneyTable(): Money
    {
        return $this->totalMoneyTable;
    }

    public function getTotalMoneyFood(): Money
    {
        return $this->totalMoneyFood;
    }

    public function getStatus(): SessionStatus
    {
        return $this->status;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function getTotalMoney(): Money
    {
        return $this->totalMoneyTable->add($this->totalMoneyFood);
    }

    public function calculateTableCost(): Money
    {
        $durationInHours = $this->timeRange->getDurationInHours();
        
        if ($durationInHours === null) {
            // Session is still active, calculate from start time to now
            $now = new \DateTimeImmutable();
            $tempTimeRange = $this->timeRange->withEndTime($now);
            $durationInHours = $tempTimeRange->getDurationInHours();
        }

        return $this->hourPrice->multiply($durationInHours);
    }

    public function endSession(\DateTimeImmutable $endTime): void
    {
        if (!$this->isPlaying()) {
            throw new \DomainException("Cannot end session that is not playing");
        }

        $this->timeRange = $this->timeRange->withEndTime($endTime);
        $this->totalMoneyTable = $this->calculateTableCost();
        $this->status = SessionStatus::COMPLETED;
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function addFoodCost(Money $amount): void
    {
        if (!$this->isPlaying()) {
            throw new \DomainException("Cannot add food cost to completed session");
        }

        $this->totalMoneyFood = $this->totalMoneyFood->add($amount);
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function cancelSession(): void
    {
        if ($this->isCompleted()) {
            throw new \DomainException("Cannot cancel completed session");
        }

        $this->status = SessionStatus::CANCELLED;
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function isPlaying(): bool
    {
        return $this->status === SessionStatus::PLAYING;
    }

    public function isCompleted(): bool
    {
        return $this->status === SessionStatus::COMPLETED;
    }

    public function isCancelled(): bool
    {
        return $this->status === SessionStatus::CANCELLED;
    }

    public function isActive(): bool
    {
        return $this->isPlaying();
    }

    public function getDurationInMinutes(): ?int
    {
        return $this->timeRange->getDurationInMinutes();
    }

    public function getDurationInHours(): ?float
    {
        return $this->timeRange->getDurationInHours();
    }
}