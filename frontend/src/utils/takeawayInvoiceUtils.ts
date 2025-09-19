import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { formatMoney } from './formatters'
import { generateVietinBankQR } from './qrGenerate'

dayjs.extend(utc)
dayjs.extend(timezone)

interface TakeawayInvoiceOrder {
  id: number
  customer_name?: string
  customer_phone?: string
  notes?: string
  total_amount: number
  order_date: string
  status: string
  items?: Array<{
    id: number
    menu_id: number
    quantity: number
    price: number
    total: number
    menu?: {
      id: number
      name: string
    }
  }>
}

export const generateTakeawayInvoiceContent = async (order: TakeawayInvoiceOrder) => {
  // Tạo mã QR thanh toán
  const qrCodeDataURL = await generateVietinBankQR(order.total_amount, order.id.toString(), 'TTTG')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hóa đơn mang về - Đơn #${order.id}</title>
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
      </div>
      
      <div class="order-info">
        ${order.customer_name ? `<p><strong>Khách hàng:</strong> ${order.customer_name}</p>` : ''}
        ${order.customer_phone ? `<p><strong>Số điện thoại:</strong> ${order.customer_phone}</p>` : ''}
      </div>
      
      <div class="items">
        <table class="table">
            <tr>
                <th>Stt</th>
                <th>Tên món</th>
                <th>SL</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
            </tr>
            ${
              order.items
                ?.map(
                  (item, idx) => `
            <tr class="item-row">
                <td>${idx + 1}</td>
                <td class="item-name">${item.menu?.name || `Món ${item.menu_id}`}</td>
                <td>x${item.quantity}</td>
                <td class="item-qty-price">
                    <div>${formatMoney(item.price)}</div>
                </td>
                <td><div style="font-weight: bold;">${formatMoney(item.total)}</div></td>
            </tr>
            `,
                )
                .join('') || ''
            }
        </table>
      </div>
        
        <div class="total">
            <h1 style="font-size:20px; margin:4px 0; text-align: right;">Tổng tiền: ${formatMoney(order.total_amount)}</h1>
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
              <p style="font-size:12px; margin: 2px 0; font-weight: bold;">Số tiền: ${formatMoney(order.total_amount)}</p>
              <p style="font-size:11px; margin: 2px 0;">ND: TTTG${order.id}</p>
            </div>
            `
                : ''
            }
            <p style="font-size:15px; margin: 3px 0;">In lúc: ${dayjs().tz('Asia/Ho_Chi_Minh').format('HH:mm DD/MM/YYYY')}</p>
        </div>
    </body>
    </html>
  `
}

export const printTakeawayInvoice = (invoiceContent: string) => {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(invoiceContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }
}
