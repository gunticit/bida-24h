import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { calculatePlayTime } from './formatters'
import { generateVietinBankQR } from './qrGenerate'
import { formatMoney } from './formatters'

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

export const generateInvoiceContent = async (
  session: InvoiceSession,
  orders: InvoiceOrder[],
  tables: InvoiceTable[],
  menus: InvoiceMenu[],
  totalTableMoney: number,
  totalFoodMoney: number,
  totalMoney: number,
) => {
  // Tạo mã QR thanh toán
  const qrCodeDataURL = await generateVietinBankQR(totalMoney, session.id.toString(), 'DHMV')
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
          margin-top: 5px;
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
          <th>Bàn</th>s
          <th>Thời gian</th>
          <th>Tiền bàn</th>
        </tr>
        <tr>
          <td>${tables.find((t) => t.id === session.table_id)?.name || 'N/A'}</td>
          <td>${calculatePlayTime(session)}</td>
          <td>${formatMoney(totalTableMoney)}</td>
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
            <td>${formatMoney(order.unit_price)}</td>
            <td>${formatMoney(order.total_price)}</td>
          </tr>
        `,
          )
          .join('')}
      </table>
      `
          : ''
      }
      <div class="total">
        <h3 style="font-size:15px; margin:4px 0; text-align: right;">Tiền bàn: ${formatMoney(totalTableMoney)}</h3>
        ${orders.length > 0 ? `<h3 style="font-size:15px; margin:4px 0; text-align: right;">Tiền đồ ăn: ${formatMoney(totalFoodMoney)}</h3>` : ''}
        <h1 style="font-size:20px; margin:4px 0; text-align: right;">Tổng tiền: ${formatMoney(totalMoney)}</h1>
      </div>
      
      <div class="footer">
        <p style="font-size:15px; margin: 3px 0;">Cảm ơn quý khách và hẹn gặp lại!</p>
         ${
           qrCodeDataURL
             ? `
            <div style="text-align: center; margin: 10px 0; border: 1px dashed #000; padding: 8px;">
                <p style="font-size:13px; margin: 5px 0; font-weight: bold;">THANH TOÁN CHUYỂN KHOẢN</p>
                <img src="${qrCodeDataURL}" style="width: 80px; height: 80px; display: block; margin: 5px auto;" alt="QR Code"/>
                <p style="font-size:12px; margin: 2px 0; font-weight: bold;">VietinBank</p>
                <p style="font-size:12px; margin: 2px 0;">STK: 104884214711</p>
                <p style="font-size:12px; margin: 2px 0;">Chủ TK: TRUONG THI THANH HIEU</p>
                <p style="font-size:12px; margin: 2px 0; font-weight: bold;">Số tiền: ${formatMoney(totalMoney)}</p>
                <p style="font-size:11px; margin: 2px 0;">ND: DHMV${session.id.toString()}</p>
            </div>
        `
             : ''
         }
        <p style="font-size:12px; margin: 3px 0;">In lúc: ${dayjs().tz('Asia/Ho_Chi_Minh').format('HH:mm DD/MM/YYYY')}</p>
      </div>
    </body>
    </html>
  `
}
