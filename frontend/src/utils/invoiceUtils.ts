import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { formatMoney, calculatePlayTime } from './formatters'

dayjs.extend(utc)
dayjs.extend(timezone)

interface InvoiceSession {
  id: number
  start_time: string
  end_time?: string | null
  hour_price: number
  table_id: number
}

interface InvoiceOrder {
  id: number
  menu_id: number
  quantity: number
  unit_price: number
  total_price: number
}

interface InvoiceTable {
  id: number
  name: string
}

interface InvoiceMenu {
  id: number
  name: string
}

export const generateInvoiceContent = (
  session: InvoiceSession,
  orders: InvoiceOrder[],
  tables: InvoiceTable[],
  menus: InvoiceMenu[],
  totalTableMoney: number,
  totalFoodMoney: number,
  totalMoney: number,
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hóa đơn - Session #${session.id}</title>
      <style>
        @page {
          size: 80mm auto; /* Chiều ngang 80mm, chiều dọc tự co */
          margin: 0;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 15px;
          margin: 0;
          padding: 4px;
          width: 80mm; /* khổ giấy */
        }
        .header {
          text-align: center;
          border-bottom: 1px dashed #000;
          padding-bottom: 4px;
          margin-bottom: 8px;
        }
        .header h1 {
          font-size: 15px;
          margin: 0;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin: 6px 0;
          font-size: 14px;
        }
        .table th, .table td {
          border: 1px solid #000;
          padding: 2px 4px;
          text-align: left;
          word-break: break-word;
        }
        .table th {
          background-color: #f9f9f9;
        }
        .total {
          font-weight: bold;
          font-size: 15px;
          margin-top: 6px;
          padding: 4px 0;
          border-top: 1px dashed #000;
          text-right: right;
        }
        .footer {
          margin-top: 10px;
          text-align: center;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="font-size:20px;">24H BILLIARDS & COFFEE</h1>
        <p style="font-size:15px; margin: 3px 0;">Địa chỉ: <b>Cổng chào thôn văn hoá Eanur, Pơngđrang, Đăk Lăk</b></p>
        <p style="font-size:15px; margin: 3px 0;">Hotline: <b>096 718 13 03</b></p>
        <p style="font-size:14px; margin: 3px 0;">Giờ bắt đầu: <b>${new Date(session.start_time).toLocaleString('vi-VN')}</b></p>
        <p style="font-size:14px; margin: 3px 0;">Giờ kết thúc: <b>${session.end_time ? new Date(session.end_time).toLocaleString('vi-VN') : 'Đang chơi'}</b></p>
      </div>
      
      <h3 style="font-size:15px; margin:4px 0;">Thông tin giờ chơi:</h3>
      <table class="table">
        <tr>
          <th>Bàn</th>
          <th>Giá/giờ</th>
          <th>Thời gian</th>
          <th>Tiền bàn</th>
        </tr>
        <tr>
          <td>${tables.find((t) => t.id === session.table_id)?.name || 'N/A'}</td>
          <td>${parseInt(session.hour_price.toString()).toLocaleString('vi-VN')} đ</td>
          <td>${calculatePlayTime(session)}</td>
          <td>${totalTableMoney.toLocaleString('vi-VN')} đ</td>
        </tr>
      </table>
      
      ${
        orders.length > 0
          ? `
      <h3 style="font-size:15px; margin:4px 0;">Thực đơn:</h3>
      <table class="table">
        <tr>
          <th>Món</th>
          <th>SL</th>
          <th>Đơn giá</th>
          <th>Thành tiền</th>
        </tr>
        ${orders
          .map(
            (order) => `
          <tr>
            <td>${menus.find((menu) => menu.id === order.menu_id)?.name || `Món ${order.menu_id}`}</td>
            <td>${order.quantity}</td>
            <td>${parseInt(order.unit_price.toString()).toLocaleString('vi-VN')} đ</td>
            <td>${parseInt(order.total_price.toString()).toLocaleString('vi-VN')} đ</td>
          </tr>
        `,
          )
          .join('')}
      </table>
      `
          : ''
      }
      
      <div class="total">
        <h3 style="font-size:15px; margin:4px 0; text-align: right;">Tiền bàn: ${parseInt(totalTableMoney.toString()).toLocaleString('vi-VN')} đ</h3>
        ${orders.length > 0 ? `<h3 style="font-size:15px; margin:4px 0; text-align: right;">Tiền đồ ăn: ${totalFoodMoney.toLocaleString('vi-VN')} đ</h3>` : ''}
        <h1 style="font-size:20px; margin:4px 0; text-align: right;">Tổng tiền: ${parseInt(totalMoney.toString()).toLocaleString('vi-VN')} đ</h1>
      </div>
      
      <div class="footer">
        <p style="font-size:15px; margin: 3px 0;">Cảm ơn quý khách đã luôn ủng hộ <br/> 24h Billiards Coffee!</p>
        <p style="font-size:15px; margin: 3px 0;">In lúc: ${dayjs().tz('Asia/Ho_Chi_Minh').format('HH:mm DD/MM/YYYY')}</p>
      </div>
    </body>
    </html>
  `
}

export const printInvoice = (invoiceContent: string) => {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(invoiceContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }
}
