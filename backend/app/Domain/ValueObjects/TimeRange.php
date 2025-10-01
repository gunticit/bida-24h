<?php

namespace App\Domain\ValueObjects;

use DateTimeImmutable;
use InvalidArgumentException;

final readonly class TimeRange
{
    public function __construct(
        private DateTimeImmutable $startTime,
        private ?DateTimeImmutable $endTime = null
    ) {
        $this->validate();
    }

    private function validate(): void
    {
        if ($this->endTime && $this->startTime >= $this->endTime) {
            throw new InvalidArgumentException("Start time must be before end time");
        }
    }

    public function getStartTime(): DateTimeImmutable
    {
        return $this->startTime;
    }

    public function getEndTime(): ?DateTimeImmutable
    {
        return $this->endTime;
    }

    public function getDurationInMinutes(): ?int
    {
        if (!$this->endTime) {
            return null;
        }

        $diff = $this->endTime->diff($this->startTime);
        return ($diff->days * 24 * 60) + ($diff->h * 60) + $diff->i;
    }

    public function getDurationInHours(): ?float
    {
        $minutes = $this->getDurationInMinutes();
        return $minutes ? $minutes / 60 : null;
    }

    public function withEndTime(DateTimeImmutable $endTime): TimeRange
    {
        return new TimeRange($this->startTime, $endTime);
    }

    public function isActive(): bool
    {
        return $this->endTime === null;
    }

    public function equals(TimeRange $other): bool
    {
        return $this->startTime == $other->startTime 
            && $this->endTime == $other->endTime;
    }
}