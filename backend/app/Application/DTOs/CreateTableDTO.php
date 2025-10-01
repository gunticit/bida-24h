<?php

namespace App\Application\DTOs;

final readonly class CreateTableDTO
{
    public function __construct(
        public string $name,
        public float $pricePerHour
    ) {}
}