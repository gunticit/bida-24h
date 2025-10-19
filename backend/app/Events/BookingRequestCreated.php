<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookingRequestCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $tableId;
    public $tableName;
    public $requestedAt;

    public function __construct($tableId, $tableName)
    {
        $this->tableId = $tableId;
        $this->tableName = $tableName;
        $this->requestedAt = now()->toISOString();
    }

    public function broadcastOn()
    {
        return new Channel('admin-notifications');
    }

    public function broadcastWith()
    {
        return [
            'type' => 'booking_request',
            'table_id' => $this->tableId,
            'table_name' => $this->tableName,
            'message' => "Có yêu cầu đặt bàn {$this->tableName}",
            'requested_at' => $this->requestedAt,
        ];
    }

    public function broadcastAs()
    {
        return 'booking.requested';
    }
}