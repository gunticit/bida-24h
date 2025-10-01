<?php

namespace App\Infrastructure\Repositories\Eloquent;

use App\Application\Contracts\Repositories\UserRepositoryInterface;
use App\Domain\Entities\User\User;
use App\Domain\Enums\UserRole;
use App\Domain\ValueObjects\Email;
use App\Models\User as UserModel;

final class EloquentUserRepository implements UserRepositoryInterface
{
    public function findById(int $id): ?User
    {
        $userModel = UserModel::find($id);
        
        if (!$userModel) {
            return null;
        }

        return $this->modelToEntity($userModel);
    }

    public function findByEmail(Email $email): ?User
    {
        $userModel = UserModel::where('email', $email->getValue())->first();
        
        if (!$userModel) {
            return null;
        }

        return $this->modelToEntity($userModel);
    }

    public function save(User $user): void
    {
        if ($user->getId() === 0) {
            // Create new user
            $userModel = new UserModel();
            $userModel->name = $user->getName();
            $userModel->email = $user->getEmail()->getValue();
            $userModel->password = $user->getHashedPassword();
            $userModel->role = $user->getRole()->value;
            $userModel->save();
            
            // Update the entity ID using reflection (since it's readonly)
            $reflection = new \ReflectionClass($user);
            $idProperty = $reflection->getProperty('id');
            $idProperty->setAccessible(true);
            $idProperty->setValue($user, $userModel->id);
        } else {
            // Update existing user
            $userModel = UserModel::find($user->getId());
            if ($userModel) {
                $userModel->name = $user->getName();
                $userModel->email = $user->getEmail()->getValue();
                $userModel->password = $user->getHashedPassword();
                $userModel->role = $user->getRole()->value;
                $userModel->save();
            }
        }
    }

    public function delete(int $id): void
    {
        UserModel::destroy($id);
    }

    public function findAll(): array
    {
        return UserModel::all()->map(fn($model) => $this->modelToEntity($model))->toArray();
    }

    public function findByRole(string $role): array
    {
        return UserModel::where('role', $role)
            ->get()
            ->map(fn($model) => $this->modelToEntity($model))
            ->toArray();
    }

    public function exists(Email $email): bool
    {
        return UserModel::where('email', $email->getValue())->exists();
    }

    private function modelToEntity(UserModel $model): User
    {
        return new User(
            id: $model->id,
            name: $model->name,
            email: new Email($model->email),
            hashedPassword: $model->password,
            role: UserRole::from($model->role),
            createdAt: $model->created_at->toDateTimeImmutable(),
            updatedAt: $model->updated_at->toDateTimeImmutable()
        );
    }
}