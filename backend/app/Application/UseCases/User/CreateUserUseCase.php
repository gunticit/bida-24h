<?php

namespace App\Application\UseCases\User;

use App\Application\Contracts\Repositories\UserRepositoryInterface;
use App\Application\DTOs\CreateUserDTO;
use App\Domain\Entities\User\User;
use App\Domain\Enums\UserRole;
use App\Domain\ValueObjects\Email;

final readonly class CreateUserUseCase
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {}

    public function execute(CreateUserDTO $dto): array
    {
        $email = new Email($dto->email);
        
        if ($this->userRepository->exists($email)) {
            throw new \DomainException("User with email {$dto->email} already exists");
        }

        $user = new User(
            id: 0, // Will be set by repository
            name: $dto->name,
            email: $email,
            hashedPassword: password_hash($dto->password, PASSWORD_DEFAULT),
            role: UserRole::from($dto->role),
            createdAt: new \DateTimeImmutable(),
            updatedAt: new \DateTimeImmutable()
        );

        $this->userRepository->save($user);

        return [
            'id' => $user->getId(),
            'name' => $user->getName(),
            'email' => $user->getEmail()->getValue(),
            'role' => $user->getRole()->value,
        ];
    }
}