<?php

namespace App\Application\UseCases\Session;

use App\Application\Contracts\Repositories\GameSessionRepositoryInterface;
use App\Application\Contracts\Repositories\TableRepositoryInterface;
use App\Application\DTOs\StartSessionDTO;
use App\Domain\Entities\Session\GameSession;
use App\Domain\Enums\SessionStatus;
use App\Domain\ValueObjects\Money;
use App\Domain\ValueObjects\TimeRange;

final readonly class StartSessionUseCase
{
    public function __construct(
        private GameSessionRepositoryInterface $sessionRepository,
        private TableRepositoryInterface $tableRepository
    ) {}

    public function execute(StartSessionDTO $dto): array
    {
        $table = $this->tableRepository->findById($dto->tableId);
        if (!$table) {
            throw new \DomainException("Table not found");
        }

        if (!$table->canStartSession()) {
            throw new \DomainException("Table is not available for starting a session");
        }

        // Check if table already has an active session
        $activeSession = $this->sessionRepository->findActiveSessionByTableId($dto->tableId);
        if ($activeSession) {
            throw new \DomainException("Table already has an active session");
        }

        $startTime = $dto->startTime ?? new \DateTimeImmutable();
        $timeRange = new TimeRange($startTime);
        $hourPrice = new Money($dto->hourPrice);

        $session = new GameSession(
            id: 0, // Will be set by repository
            tableId: $dto->tableId,
            timeRange: $timeRange,
            hourPrice: $hourPrice,
            totalMoneyTable: new Money(0),
            totalMoneyFood: new Money(0),
            status: SessionStatus::PLAYING,
            createdAt: new \DateTimeImmutable(),
            updatedAt: new \DateTimeImmutable()
        );

        // Start the session on the table
        $table->startSession();
        
        $this->tableRepository->save($table);
        $this->sessionRepository->save($session);

        return [
            'id' => $session->getId(),
            'table_id' => $session->getTableId(),
            'start_time' => $session->getTimeRange()->getStartTime()->format('Y-m-d H:i:s'),
            'hour_price' => $session->getHourPrice()->getAmount(),
            'status' => $session->getStatus()->value,
        ];
    }
}