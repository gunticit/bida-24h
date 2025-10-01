<?php

namespace App\Application\DTOs;

final readonly class CreateUserDTO
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public string $role = 'customer'
    ) {}
}