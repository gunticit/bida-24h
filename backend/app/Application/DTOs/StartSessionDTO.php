<?php

namespace App\Application\DTOs;

final readonly class StartSessionDTO
{
    public function __construct(
        public int $tableId,
        public float $hourPrice,
        public ?\DateTimeImmutable $startTime = null
    ) {}
}