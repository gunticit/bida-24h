<?php

namespace App\Domain\Enums;

enum SessionStatus: string
{
    case PLAYING = 'playing';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';
}