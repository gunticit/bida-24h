import { PlaytimeReportData } from '@/types/api'
import { formatMoney, formatDateTime } from './formatters'

export const printPlaytimeReport = (reportData: PlaytimeReportData) => {
  const printWindow = window.open('', '_blank')

  if (!printWindow) {
    alert('Vui lòng cho phép popup để in báo cáo')
    return
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>BÁO CÁO GIỜ CHƠI BILLIARD - ${reportData.from_date} đến ${reportData.to_date}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #2196f3;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #2196f3;
          margin-bottom: 10px;
          font-size: 28px;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .summary-card {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
        }
        .summary-card h3 {
          margin: 0 0 10px 0;
          color: #495057;
          font-size: 14px;
          text-transform: uppercase;
        }
        .value {
          font-size: 24px;
          font-weight: bold;
          color: #2196f3;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #2196f3;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .total-row {
          font-weight: bold;
          background-color: #e3f2fd !important;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
        }
        @media print {
          body {
            margin: 0;
            padding: 15px;
          }
          .header h1 {
            font-size: 24px;
          }
          .summary {
            grid-template-columns: 1fr 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>BÁO CÁO GIỜ CHƠI BILLIARD</h1>
        <p><strong>Khoảng thời gian:</strong> ${formatDateTime(reportData.from_date)} - ${formatDateTime(reportData.to_date)}</p>
        <p><strong>Ngày xuất báo cáo:</strong> ${formatDateTime(new Date().toISOString())}</p>
      </div>

      <div class="summary">
        <div class="summary-card">
          <h3>Tổng sessions</h3>
          <div class="value">${reportData.total_sessions}</div>
        </div>
        <div class="summary-card">
          <h3>Tổng doanh thu</h3>
          <div class="value">${formatMoney(reportData.total_revenue)}</div>
        </div>
        <div class="summary-card">
          <h3>Doanh thu bàn</h3>
          <div class="value">${formatMoney(reportData.total_table_revenue)}</div>
        </div>
        <div class="summary-card">
          <h3>Doanh thu đồ ăn</h3>
          <div class="value">${formatMoney(reportData.total_food_revenue)}</div>
        </div>
        <div class="summary-card">
          <h3>Tổng giờ chơi</h3>
          <div class="value">${reportData.summary.total_play_hours.toFixed(1)} giờ</div>
        </div>
        <div class="summary-card">
          <h3>Thời gian TB/session</h3>
          <div class="value">${reportData.summary.avg_session_duration.toFixed(1)} phút</div>
        </div>
      </div>

      <h2>Thống kê theo bàn</h2>
      <table>
        <thead>
          <tr>
            <th>Tên bàn</th>
            <th>Số sessions</th>
            <th>Tổng giờ chơi</th>
            <th>Doanh thu bàn</th>
            <th>Doanh thu đồ ăn</th>
            <th>Tổng doanh thu</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.table_stats.map(table => `
            <tr>
              <td>${table.table_name}</td>
              <td class="text-center">${table.sessions_count}</td>
              <td class="text-right">${table.total_hours.toFixed(1)} giờ</td>
              <td class="text-right">${formatMoney(table.table_revenue)}</td>
              <td class="text-right">${formatMoney(table.food_revenue)}</td>
              <td class="text-right">${formatMoney(table.total_revenue)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td><strong>TỔNG CỘNG</strong></td>
            <td class="text-center"><strong>${reportData.total_sessions}</strong></td>
            <td class="text-right"><strong>${reportData.summary.total_play_hours.toFixed(1)} giờ</strong></td>
            <td class="text-right"><strong>${formatMoney(reportData.total_table_revenue)}</strong></td>
            <td class="text-right"><strong>${formatMoney(reportData.total_food_revenue)}</strong></td>
            <td class="text-right"><strong>${formatMoney(reportData.total_revenue)}</strong></td>
          </tr>
        </tbody>
      </table>

      ${reportData.food_stats.length > 0 ? `
      <h2>Thống kê đồ ăn/uống (chỉ trong giờ chơi)</h2>
      <table>
        <thead>
          <tr>
            <th>Tên món</th>
            <th>Loại</th>
            <th>Số lượng bán</th>
            <th>Đơn giá</th>
            <th>Tổng tiền</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.food_stats.map(food => {
            const categoryText = food.category === 'food' ? 'Đồ ăn' : 
                                food.category === 'drink' ? 'Đồ uống' : 'Thuốc lá'
            return `
            <tr>
              <td>${food.menu_name}</td>
              <td>${categoryText}</td>
              <td class="text-center">${food.total_quantity}</td>
              <td class="text-right">${formatMoney(food.unit_price)}</td>
              <td class="text-right">${formatMoney(food.total_amount)}</td>
            </tr>
            `
          }).join('')}
          <tr class="total-row">
            <td colspan="2"><strong>TỔNG CỘNG</strong></td>
            <td class="text-center"><strong>${reportData.summary.total_food_items_sold}</strong></td>
            <td></td>
            <td class="text-right"><strong>${formatMoney(reportData.total_food_revenue)}</strong></td>
          </tr>
        </tbody>
      </table>
      ` : ''}

      <div class="footer">
        <p>--- Hết báo cáo ---</p>
        <p>Được tạo bởi hệ thống quản lý 24h Billiard</p>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()

  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print()
    // Close window after printing (optional)
    printWindow.onafterprint = () => {
      printWindow.close()
    }
  }
}