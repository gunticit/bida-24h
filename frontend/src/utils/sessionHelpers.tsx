import React from 'react'
import { Chip } from '@mui/material'
import {
  Restaurant as FoodIcon,
  LocalBar as DrinkIcon,
  SmokingRooms as TobaccoIcon,
  TakeoutDining as TakeawayIcon,
} from '@mui/icons-material'

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'playing':
      return 'primary'
    case 'finished':
      return 'success'
    case 'canceled':
      return 'error'
    default:
      return 'default'
  }
}

export const getStatusText = (status: string) => {
  switch (status) {
    case 'playing':
      return 'Đang chơi'
    case 'finished':
      return 'Đã kết thúc'
    case 'canceled':
      return 'Đã hủy'
    default:
      return status
  }
}

export const getCategoryChip = (category: string) => {
  const getCategoryInfo = (cat: string) => {
    switch (cat) {
      case 'food':
        return { icon: React.createElement(FoodIcon), label: 'Đồ ăn', color: 'primary' as const }
      case 'drink':
        return {
          icon: React.createElement(DrinkIcon),
          label: 'Đồ uống',
          color: 'secondary' as const,
        }
      case 'tobacco':
        return {
          icon: React.createElement(TobaccoIcon),
          label: 'Thuốc lá',
          color: 'warning' as const,
        }
      case 'takeaway':
        return { icon: React.createElement(TakeawayIcon), label: 'Mang về', color: 'info' as const }
      default:
        return {
          icon: React.createElement(FoodIcon),
          label: 'Không xác định',
          color: 'default' as const,
        }
    }
  }

  const categoryInfo = getCategoryInfo(category)
  return React.createElement(Chip, {
    icon: categoryInfo.icon,
    label: categoryInfo.label,
    color: categoryInfo.color,
    variant: 'outlined',
    size: 'small',
  })
}
