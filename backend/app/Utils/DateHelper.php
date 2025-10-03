<?php

namespace App\Utils;

use Carbon\Carbon;

class DateHelper
{
    /**
     * Format date to d-m-Y format
     *
     * @param string|Carbon $date
     * @return string
     */
    public static function formatToVietnamese($date): string
    {
        if (is_string($date)) {
            $date = Carbon::parse($date);
        }
        
        return $date->format('d-m-Y');
    }

    /**
     * Format date range for filename
     *
     * @param string|Carbon $fromDate
     * @param string|Carbon $toDate
     * @return string
     */
    public static function formatDateRangeForFilename($fromDate, $toDate): string
    {
        $from = self::formatToVietnamese($fromDate);
        $to = self::formatToVietnamese($toDate);
        
        return "tu-{$from}-{$to}";
    }

    /**
     * Generate timestamp for filename
     *
     * @return string
     */
    public static function generateTimestampForFilename(): string
    {
        return now()->format('Y-m-d-H-i-s');
    }
}