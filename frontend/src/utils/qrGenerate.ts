// Tạo mã QR thanh toán VietinBank
export const generateVietinBankQR = async (amount: number, orderNumber: string, content?: string): Promise<string> => {
  try {
    // Sử dụng format VietQR chuẩn cho VietinBank
    // Format: 00020101021138580010A00000072701270006970415011504884214711020824H BILLIARDS COFFEE0303VND5405${amount}6304
    
    // Tạo URL VietQR API để tạo QR code chuẩn
    const vietQRData = {
      accountNo: '104884214711',
      accountName: '24H BILLIARDS COFFEE',
      acqId: '970415', // VietinBank
      amount: amount,
      addInfo: `${content || 'DH'}${orderNumber}`,
      format: 'text',
      template: 'compact'
    }
    
    // Sử dụng VietQR API để tạo QR code chuẩn
    const vietQRUrl = `https://img.vietqr.io/image/${vietQRData.acqId}-${vietQRData.accountNo}-qr_only.png?amount=${vietQRData.amount}&addInfo=${vietQRData.addInfo}&accountName=${encodeURIComponent(vietQRData.accountName)}`
    return vietQRUrl;
  } catch (error) {
    console.error('Lỗi tạo QR code:', error)
    return ''
  }
}