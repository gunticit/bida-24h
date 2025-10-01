<?php

namespace App\Application\UseCases\Auth;

use App\Application\Contracts\Repositories\UserRepositoryInterface;
use App\Domain\ValueObjects\Email;

final readonly class LoginUseCase
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {}

    public function execute(string $email, string $password): ?array
    {
        $emailVO = new Email($email);
        $user = $this->userRepository->findByEmail($emailVO);

        if (!$user) {
            return null;
        }

        if (!password_verify($password, $user->getHashedPassword())) {
            return null;
        }

        return [
            'id' => $user->getId(),
            'name' => $user->getName(),
            'email' => $user->getEmail()->getValue(),
            'role' => $user->getRole()->value,
        ];
    }
}