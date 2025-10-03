<?php

namespace App\Http\Controllers\Api\Traits;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Carbon\Carbon;

trait ExcelReportTrait
{
    /**
     * Format minutes to "X giờ Y phút" format
     */
    private function formatMinutesToHoursAndMinutes($totalMinutes)
    {
        $totalMinutes = $totalMinutes ?? 0;
        $hours = intval($totalMinutes / 60);
        $minutes = $totalMinutes % 60;
        
        if ($hours > 0 && $minutes > 0) {
            return "{$hours}h {$minutes}p";
        } elseif ($hours > 0) {
            return "{$hours}h";
        } elseif ($minutes > 0) {
            return "{$minutes}p";
        } else {
            return "0p";
        }
    }

    /**
     * Create Excel file for Session Report
     */
    private function createSessionExcelFile($reportData, $filePath)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set document properties
        $spreadsheet->getProperties()
            ->setCreator('24H Billiard System')
            ->setTitle('Báo cáo Giờ chơi')
            ->setSubject('Playtime Report')
            ->setDescription('Báo cáo giờ chơi billiard từ ' . ($reportData['from_date'] ?? '') . ' đến ' . ($reportData['to_date'] ?? ''));

        $fromDate = isset($reportData['from_date']) ? Carbon::parse($reportData['from_date'])->format('d/m/Y') : '';
        $toDate = isset($reportData['to_date']) ? Carbon::parse($reportData['to_date'])->format('d/m/Y') : '';

        // Header
        $sheet->setCellValue('A1', 'BÁO CÁO GIỜ CHƠI BILLIARD');
        $sheet->mergeCells('A1:F1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->setCellValue('A2', "Khoảng thời gian: {$fromDate} - {$toDate}");
        $sheet->mergeCells('A2:F2');
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->setCellValue('A3', 'Ngày xuất báo cáo: ' . date('d/m/Y H:i:s'));
        $sheet->mergeCells('A3:F3');
        $sheet->getStyle('A3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $currentRow = 5;

        // Summary section
        $sheet->setCellValue('A' . $currentRow, 'TỔNG QUAN');
        $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true)->setSize(14);
        $currentRow++;

        // Table statistics
        if (!empty($reportData['table_stats'])) {
            $sheet->setCellValue('A' . $currentRow, 'THỐNG KÊ THEO BÀN');
            $sheet->mergeCells('A' . $currentRow . ':F' . $currentRow);
            $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true)->setSize(16);
            $sheet->getStyle('A' . $currentRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true)->setSize(14);
            $currentRow++;

            // Headers
            $headers = ['Tên bàn', 'Số sessions', 'Thời gian chơi', 'Doanh thu bàn', 'Doanh thu đồ ăn', 'Tổng doanh thu'];
            $col = 'A';
            foreach ($headers as $header) {
                $sheet->setCellValue($col . $currentRow, $header);
                $sheet->getStyle($col . $currentRow)->getFont()->setBold(true);
                $sheet->getStyle($col . $currentRow)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('E8F4FD');
                $col++;
            }
            $currentRow++;

            // Data
            foreach ($reportData['table_stats'] as $stat) {
                $sheet->setCellValue('A' . $currentRow, $stat['table_name'] ?? '');
                $sheet->setCellValue('B' . $currentRow, number_format($stat['sessions_count'] ?? 0));
                $sheet->setCellValue('C' . $currentRow, $this->formatMinutesToHoursAndMinutes($stat['total_hours'] ?? 0));
                $sheet->setCellValue('D' . $currentRow, number_format($stat['table_revenue'] ?? 0, 0, ',', '.') . ' đ');
                $sheet->setCellValue('E' . $currentRow, number_format($stat['food_revenue'] ?? 0, 0, ',', '.') . ' đ');
                $sheet->setCellValue('F' . $currentRow, number_format($stat['total_revenue'] ?? 0, 0, ',', '.') . ' đ');
                $currentRow++;
            }

            $currentRow += 2;
        }

        // Food statistics
        if (!empty($reportData['food_stats'])) {
            $sheet->setCellValue('A' . $currentRow, 'THỐNG KÊ THEO MÓN ĂN');
            $sheet->mergeCells('A' . $currentRow . ':F' . $currentRow);
            $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true)->setSize(16);
            $sheet->getStyle('A' . $currentRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true)->setSize(14);
            $currentRow++;

            // Headers
            $headers = ['Tên món', 'Số lượng bán', 'Đơn giá', 'Tổng doanh thu'];
            $col = 'A';
            foreach ($headers as $header) {
                $sheet->setCellValue($col . $currentRow, $header);
                $sheet->getStyle($col . $currentRow)->getFont()->setBold(true);
                $sheet->getStyle($col . $currentRow)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('E8F4FD');
                $col++;
            }
            $currentRow++;

            // Data
            foreach ($reportData['food_stats'] as $stat) {
                $sheet->setCellValue('A' . $currentRow, $stat['menu_name'] ?? '');
                $sheet->setCellValue('B' . $currentRow, number_format($stat['total_quantity'] ?? 0));
                $sheet->setCellValue('C' . $currentRow, number_format($stat['unit_price'] ?? 0, 0, ',', '.') . ' đ');
                $sheet->setCellValue('D' . $currentRow, number_format($stat['total_amount'] ?? 0, 0, ',', '.') . ' đ');
                $currentRow++;
            }
        }

        $currentRow += 2;

        // Header
        $sheet->setCellValue('A' . $currentRow, 'TỔNG CỘNG');
        $sheet->mergeCells('A' . $currentRow . ':F' . $currentRow);
        $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true)->setSize(16);
        $sheet->getStyle('A' . $currentRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $currentRow += 1;

        $summaryData = [
            ['Tổng số sessions', number_format($reportData['total_sessions'] ?? 0), '', '', 'Tổng doanh thu', number_format($reportData['total_revenue'] ?? 0, 0, ',', '.') . ' đ'],
            ['Doanh thu bàn', number_format($reportData['total_table_revenue'] ?? 0, 0, ',', '.') . ' đ', '', '', 'Doanh thu đồ ăn', number_format($reportData['total_food_revenue'] ?? 0, 0, ',', '.') . ' đ'],
            ['Tổng thời gian chơi', $this->formatMinutesToHoursAndMinutes($reportData['total_play_time'] ?? 0)],
            ['Thời gian trung bình/session', round(($reportData['summary']['avg_session_duration'] ?? 0), 2) . ' phút', '', '', 'Doanh thu trung bình/session', number_format($reportData['summary']['avg_revenue_per_session'] ?? 0, 0, ',', '.') . ' đ'],
        ];

        foreach ($summaryData as $data) {
            $sheet->setCellValue('A' . $currentRow, ''.$data[0]);
            $sheet->setCellValue('B' . $currentRow, $data[1]);
            $sheet->setCellValue('C' . $currentRow, null);
            $sheet->setCellValue('D' . $currentRow, null);
            $sheet->setCellValue('E' . $currentRow, $data[4] ?? '');
            $sheet->setCellValue('F' . $currentRow, $data[5] ?? '');
            $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true);
            $sheet->getStyle('E' . $currentRow)->getFont()->setBold(true);
            $currentRow++;
        }

        // Auto-size columns
        foreach (range('A', 'F') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Add borders to all cells with data
        $highestRow = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();
        $sheet->getStyle('A1:' . $highestColumn . $highestRow)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        // Save file
        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);
    }

    /**
     * Create Excel file for Takeaway Report
     */
    private function createTakeawayExcelFile($reportData, $filePath)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set document properties
        $spreadsheet->getProperties()
            ->setCreator('24H Billiard System')
            ->setTitle('Báo cáo Takeaway')
            ->setSubject('Takeaway Report')
            ->setDescription('Báo cáo đơn hàng takeaway từ ' . ($reportData['from_date'] ?? '') . ' đến ' . ($reportData['to_date'] ?? ''));

        $fromDate = isset($reportData['from_date']) ? Carbon::parse($reportData['from_date'])->format('d/m/Y') : '';
        $toDate = isset($reportData['to_date']) ? Carbon::parse($reportData['to_date'])->format('d/m/Y') : '';

        // Header
        $sheet->setCellValue('A1', 'BÁO CÁO ĐƠN HÀNG TAKEAWAY');
        $sheet->mergeCells('A1:D1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->setCellValue('A2', "Khoảng thời gian: {$fromDate} - {$toDate}");
        $sheet->mergeCells('A2:D2');
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->setCellValue('A3', 'Ngày xuất báo cáo: ' . date('d/m/Y H:i:s'));
        $sheet->mergeCells('A3:D3');
        $sheet->getStyle('A3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $currentRow = 5;

        $summaryData = [
            ['Tổng số đơn hàng', number_format($reportData['total_orders'] ?? 0)],
            ['Tổng doanh thu', number_format($reportData['total_amount'] ?? 0, 0, ',', '.') . ' đ'],
            ['Doanh thu trung bình/đơn', number_format(($reportData['summary']['average_order_value'] ?? 0), 0, ',', '.') . ' đ'],
            ['Tổng số món bán', number_format($reportData['summary']['total_items_sold'] ?? 0)],
        ];

        foreach ($summaryData as $data) {
            $sheet->setCellValue('A' . $currentRow, $data[0]);
            $sheet->setCellValue('B' . $currentRow, $data[1]);
            $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true);
            $currentRow++;
        }

        $currentRow += 2;

        // Menu statistics
        if (!empty($reportData['items'])) {
            $sheet->setCellValue('A' . $currentRow, 'THỐNG KÊ THEO MÓN ĂN');
            $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true)->setSize(14);
            $currentRow++;

            // Headers
            $headers = ['Tên món', 'Số lượng bán', 'Đơn giá', 'Tổng doanh thu'];
            $col = 'A';
            foreach ($headers as $header) {
                $sheet->setCellValue($col . $currentRow, $header);
                $sheet->getStyle($col . $currentRow)->getFont()->setBold(true);
                $sheet->getStyle($col . $currentRow)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('E8F4FD');
                $col++;
            }
            $currentRow++;

            // Data
            foreach ($reportData['items'] as $item) {
                $sheet->setCellValue('A' . $currentRow, $item['menu_name'] ?? '');
                $sheet->setCellValue('B' . $currentRow, number_format($item['total_quantity'] ?? 0));
                $sheet->setCellValue('C' . $currentRow, number_format($item['price'] ?? 0, 0, ',', '.') . ' đ');
                $sheet->setCellValue('D' . $currentRow, number_format($item['total_amount'] ?? 0, 0, ',', '.') . ' đ');
                $currentRow++;
            }
        }

        // Auto-size columns
        foreach (range('A', 'D') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Add borders to all cells with data
        $highestRow = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();
        $sheet->getStyle('A1:' . $highestColumn . $highestRow)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        // Save file
        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);
    }

    /**
     * Create Excel file for Dine-in Report  
     */
    private function createDineInExcelFile($reportData, $filePath)
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set document properties
        $spreadsheet->getProperties()
            ->setCreator('24H Billiard System')
            ->setTitle('Báo cáo Dine-in')
            ->setSubject('Dine-in Report')
            ->setDescription('Báo cáo đơn hàng dine-in từ ' . ($reportData['from_date'] ?? '') . ' đến ' . ($reportData['to_date'] ?? ''));

        $fromDate = isset($reportData['from_date']) ? Carbon::parse($reportData['from_date'])->format('d/m/Y') : '';
        $toDate = isset($reportData['to_date']) ? Carbon::parse($reportData['to_date'])->format('d/m/Y') : '';

        // Header
        $sheet->setCellValue('A1', 'BÁO CÁO ĐƠN HÀNG DINE-IN');
        $sheet->mergeCells('A1:D1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->setCellValue('A2', "Khoảng thời gian: {$fromDate} - {$toDate}");
        $sheet->mergeCells('A2:D2');
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->setCellValue('A3', 'Ngày xuất báo cáo: ' . date('d/m/Y H:i:s'));
        $sheet->mergeCells('A3:D3');
        $sheet->getStyle('A3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $currentRow = 5;

        // Summary section
        $sheet->setCellValue('A' . $currentRow, 'TỔNG QUAN');
        $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true)->setSize(14);
        $currentRow++;

        $summaryData = [
            ['Tổng số đơn hàng', number_format($reportData['total_orders'] ?? 0)],
            ['Tổng doanh thu', number_format($reportData['total_amount'] ?? 0, 0, ',', '.') . ' đ'],
            ['Doanh thu trung bình/đơn', number_format(($reportData['summary']['average_order_value'] ?? 0), 0, ',', '.') . ' đ'],
            ['Tổng số món bán', number_format($reportData['summary']['total_items_sold'] ?? 0)],
        ];

        foreach ($summaryData as $data) {
            $sheet->setCellValue('A' . $currentRow, $data[0]);
            $sheet->setCellValue('B' . $currentRow, $data[1]);
            $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true);
            $currentRow++;
        }

        $currentRow += 2;

        // Menu statistics
        if (!empty($reportData['items'])) {
            $sheet->setCellValue('A' . $currentRow, 'THỐNG KÊ THEO MÓN ĂN');
            $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true)->setSize(14);
            $currentRow++;

            // Headers
            $headers = ['Tên món', 'Số lượng bán', 'Đơn giá', 'Tổng doanh thu'];
            $col = 'A';
            foreach ($headers as $header) {
                $sheet->setCellValue($col . $currentRow, $header);
                $sheet->getStyle($col . $currentRow)->getFont()->setBold(true);
                $sheet->getStyle($col . $currentRow)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('E8F4FD');
                $col++;
            }
            $currentRow++;

            // Data
            foreach ($reportData['items'] as $item) {
                $sheet->setCellValue('A' . $currentRow, $item['menu_name'] ?? '');
                $sheet->setCellValue('B' . $currentRow, number_format($item['total_quantity'] ?? 0));
                $sheet->setCellValue('C' . $currentRow, number_format($item['price'] ?? 0, 0, ',', '.') . ' đ');
                $sheet->setCellValue('D' . $currentRow, number_format($item['total_amount'] ?? 0, 0, ',', '.') . ' đ');
                $currentRow++;
            }
        }

        // Auto-size columns
        foreach (range('A', 'D') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Add borders to all cells with data
        $highestRow = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();
        $sheet->getStyle('A1:' . $highestColumn . $highestRow)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        // Save file
        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);
    }
}