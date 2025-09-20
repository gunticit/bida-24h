import { TakeawayReportData } from '@/types/api'
import { formatMoney, formatDateTime } from './formatters'

export const printTakeawayReport = (reportData: TakeawayReportData) => {
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
      <title>Báo cáo Takeaway - ${reportData.from_date} đến ${reportData.to_date}</title>
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
          margin: 0;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
          font-size: 16px;
        }
        .summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .summary-card {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }
        .summary-card h3 {
          margin: 0 0 10px 0;
          color: #2196f3;
        }
        .summary-card .value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
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
        <h1>BÁO CÁO TAKEAWAY</h1>
        <p><strong>Khoảng thời gian:</strong> ${formatDateTime(reportData.from_date)} - ${formatDateTime(reportData.to_date)}</p>
        <p><strong>Ngày xuất báo cáo:</strong> ${formatDateTime(new Date().toISOString())}</p>
      </div>

      <div class="summary">
        <div class="summary-card">
          <h3>Tổng đơn hàng</h3>
          <div class="value">${reportData.total_orders}</div>
        </div>
        <div class="summary-card">
          <h3>Tổng doanh thu</h3>
          <div class="value">${formatMoney(reportData.total_amount)}</div>
        </div>
        <div class="summary-card">
          <h3>Tổng sản phẩm bán</h3>
          <div class="value">${reportData.summary.total_items_sold}</div>
        </div>
        <div class="summary-card">
          <h3>Giá trị trung bình/đơn</h3>
          <div class="value">${formatMoney(reportData.summary.average_order_value)}</div>
        </div>
      </div>

      <h2 style="color: #2196f3; margin-bottom: 15px;">Chi tiết sản phẩm</h2>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên sản phẩm</th>
            <th class="text-center">Số lượng bán</th>
            <th class="text-right">Đơn giá</th>
            <th class="text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.items.map((item, index) => `
            <tr>
              <td class="text-center">${index + 1}</td>
              <td>${item.menu_name}</td>
              <td class="text-center">${item.total_quantity}</td>
              <td class="text-right">${formatMoney(item.unit_price)}</td>
              <td class="text-right">${formatMoney(item.total_amount)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2" class="text-center"><strong>TỔNG CỘNG</strong></td>
            <td class="text-center"><strong>${reportData.summary.total_items_sold}</strong></td>
            <td></td>
            <td class="text-right"><strong>${formatMoney(reportData.total_amount)}</strong></td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <p>24H Billiards Coffee - Hệ thống quản lý</p>
        <p>© ${new Date().getFullYear()} - Báo cáo được tạo tự động</p>
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