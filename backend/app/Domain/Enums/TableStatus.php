<?php

namespace App\Domain\Enums;

enum TableStatus: string
{
    case AVAILABLE = 'available';
    case PLAYING = 'playing';
    case MAINTENANCE = 'maintenance';
}