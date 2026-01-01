import React from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'
import { formatMoney } from '@/utils/formatters'

interface RevenueCardProps {
  title: string
  value: number | null | undefined
  icon: React.ReactNode
  color?: 'primary' | 'success' | 'info' | 'warning' | 'error' | 'secondary'
  isMoney?: boolean
}

const colorMap: Record<string, { bg: string; border: string; iconBg: string; text: string }> = {
  primary: {
    bg: 'linear-gradient(145deg, rgba(177,10,28,0.08) 0%, rgba(220,20,60,0.12) 100%)',
    border: '#DC143C',
    iconBg: 'linear-gradient(135deg, #DC143C 0%, #FF4500 100%)',
    text: '#8B0000',
  },
  success: {
    bg: 'linear-gradient(145deg, rgba(34,197,94,0.08) 0%, rgba(22,163,74,0.12) 100%)',
    border: '#22C55E',
    iconBg: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
    text: '#166534',
  },
  info: {
    bg: 'linear-gradient(145deg, rgba(59,130,246,0.08) 0%, rgba(37,99,235,0.12) 100%)',
    border: '#3B82F6',
    iconBg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    text: '#1E40AF',
  },
  warning: {
    bg: 'linear-gradient(145deg, rgba(245,158,11,0.08) 0%, rgba(217,119,6,0.12) 100%)',
    border: '#F59E0B',
    iconBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    text: '#92400E',
  },
  error: {
    bg: 'linear-gradient(145deg, rgba(239,68,68,0.08) 0%, rgba(220,38,38,0.12) 100%)',
    border: '#EF4444',
    iconBg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    text: '#991B1B',
  },
  secondary: {
    bg: 'linear-gradient(145deg, rgba(107,114,128,0.08) 0%, rgba(75,85,99,0.12) 100%)',
    border: '#6B7280',
    iconBg: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
    text: '#374151',
  },
}

export const RevenueCard: React.FC<RevenueCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  isMoney = false,
}) => {
  const colors = colorMap[color] || colorMap.primary

  return (
    <Card
      sx={{
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: '16px',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px rgba(0,0,0,0.15)`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: colors.text,
                fontWeight: 600,
                mb: 0.5,
                opacity: 0.8,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: colors.text,
              }}
            >
              {isMoney ? formatMoney(value ?? 0) : (value ?? 0)}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '12px',
              background: colors.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

