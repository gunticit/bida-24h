<?php

namespace App\Application\DTOs;

final readonly class UpdateUserDTO
{
    public function __construct(
        public int $id,
        public ?string $name = null,
        public ?string $email = null,
        public ?string $password = null,
        public ?string $role = null
    ) {}
}