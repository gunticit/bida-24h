<?php

namespace App\Domain\ValueObjects;

use InvalidArgumentException;

final readonly class Money
{
    public function __construct(
        private float $amount,
        private string $currency = 'VND'
    ) {
        $this->validate();
    }

    private function validate(): void
    {
        if ($this->amount < 0) {
            throw new InvalidArgumentException("Money amount cannot be negative: {$this->amount}");
        }
    }

    public function getAmount(): float
    {
        return $this->amount;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }

    public function add(Money $other): Money
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException("Cannot add different currencies");
        }

        return new Money($this->amount + $other->amount, $this->currency);
    }

    public function subtract(Money $other): Money
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException("Cannot subtract different currencies");
        }

        return new Money($this->amount - $other->amount, $this->currency);
    }

    public function multiply(float $multiplier): Money
    {
        return new Money($this->amount * $multiplier, $this->currency);
    }

    public function equals(Money $other): bool
    {
        return $this->amount === $other->amount && $this->currency === $other->currency;
    }

    public function isGreaterThan(Money $other): bool
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException("Cannot compare different currencies");
        }

        return $this->amount > $other->amount;
    }

    public function __toString(): string
    {
        return number_format($this->amount, 0, '.', ',') . ' ' . $this->currency;
    }
}