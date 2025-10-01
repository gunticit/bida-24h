<?php

namespace App\Application\UseCases\Session;

use App\Application\Contracts\Repositories\GameSessionRepositoryInterface;
use App\Application\Contracts\Repositories\TableRepositoryInterface;

final readonly class EndSessionUseCase
{
    public function __construct(
        private GameSessionRepositoryInterface $sessionRepository,
        private TableRepositoryInterface $tableRepository
    ) {}

    public function execute(int $sessionId, ?\DateTimeImmutable $endTime = null): array
    {
        $session = $this->sessionRepository->findById($sessionId);
        if (!$session) {
            throw new \DomainException("Session not found");
        }

        if (!$session->isPlaying()) {
            throw new \DomainException("Session is not active");
        }

        $table = $this->tableRepository->findById($session->getTableId());
        if (!$table) {
            throw new \DomainException("Table not found");
        }

        $endTime = $endTime ?? new \DateTimeImmutable();
        
        // End the session
        $session->endSession($endTime);
        
        // Make table available
        $table->endSession();

        $this->sessionRepository->save($session);
        $this->tableRepository->save($table);

        return [
            'id' => $session->getId(),
            'table_id' => $session->getTableId(),
            'start_time' => $session->getTimeRange()->getStartTime()->format('Y-m-d H:i:s'),
            'end_time' => $session->getTimeRange()->getEndTime()?->format('Y-m-d H:i:s'),
            'duration_hours' => $session->getDurationInHours(),
            'total_money_table' => $session->getTotalMoneyTable()->getAmount(),
            'total_money_food' => $session->getTotalMoneyFood()->getAmount(),
            'total_money' => $session->getTotalMoney()->getAmount(),
            'status' => $session->getStatus()->value,
        ];
    }
}