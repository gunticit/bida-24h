// Format utilities
export const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('vi-VN')
}

// Round to nearest thousand (29500 -> 30000, 29400 -> 29000)
export const roundToThousand = (amount: number) => {
  return Math.round(amount / 1000) * 1000
}

// Format money with rounding to nearest thousand
export const formatMoney = (amount: number | null) => {
  if (amount === null) return '0 đ'
  const roundedAmount = roundToThousand(amount)
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(roundedAmount);
}

export const calculatePlayTime = (session: { start_time: string; end_time?: string | null }) => {
  if (!session.end_time) return 'Đang chơi'

  const startTime = new Date(session.start_time)
  const endTime = new Date(session.end_time)
  const diffTime = Math.abs(endTime.getTime() - startTime.getTime())
  const diffMinutes = Math.ceil(diffTime / (1000 * 60))
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  if (hours > 0) {
    return `${hours} giờ ${minutes} phút`
  }
  return `${minutes} phút`
}

export const formatTimeWithMinutes = (totalMinutes: number | null) => {
  if (!totalMinutes) return '-'
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}p`
}

export const formatCurrency = (amount: number) => {
  const roundedAmount = roundToThousand(amount)
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(roundedAmount)
}
