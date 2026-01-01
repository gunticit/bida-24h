import React from 'react'
import { Card, CardContent, Typography, Box } from '@mui/material'
import {
  ViewList as TotalIcon,
  PlayCircle as PlayingIcon,
  CheckCircle as FinishedIcon,
  Cancel as CanceledIcon
} from '@mui/icons-material'

interface StatisticsCardsProps {
  sessions: Array<{ status: string }>
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  gradient: string
  borderColor: string
  valueColor: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient, borderColor, valueColor }) => (
  <Card
    sx={{
      border: `2px solid ${borderColor}`,
      borderRadius: '16px',
      background: gradient,
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      position: 'relative',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 25px rgba(0,0,0,0.15)`,
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${borderColor}, transparent)`,
      },
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: '#666',
              fontWeight: 500,
              mb: 0.5,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              color: valueColor,
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${valueColor}15, ${valueColor}30)`,
            border: `1px solid ${valueColor}30`,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
)

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ sessions }) => {
  const totalCount = sessions.length
  const playingCount = sessions.filter((s) => s.status === 'playing').length
  const finishedCount = sessions.filter((s) => s.status === 'finished').length
  const canceledCount = sessions.filter((s) => s.status === 'canceled').length

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 2.5,
        mb: 3,
      }}
    >
      <StatCard
        title="Tổng số Session"
        value={totalCount}
        icon={<TotalIcon sx={{ fontSize: 32, color: '#8B0000' }} />}
        gradient="linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,248,220,0.95) 100%)"
        borderColor="#FFD700"
        valueColor="#8B0000"
      />
      <StatCard
        title="Đang chơi"
        value={playingCount}
        icon={<PlayingIcon sx={{ fontSize: 32, color: '#DC143C' }} />}
        gradient="linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,240,240,0.95) 100%)"
        borderColor="#DC143C"
        valueColor="#DC143C"
      />
      <StatCard
        title="Đã kết thúc"
        value={finishedCount}
        icon={<FinishedIcon sx={{ fontSize: 32, color: '#2E7D32' }} />}
        gradient="linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(232,245,233,0.95) 100%)"
        borderColor="#4CAF50"
        valueColor="#2E7D32"
      />
      <StatCard
        title="Đã hủy"
        value={canceledCount}
        icon={<CanceledIcon sx={{ fontSize: 32, color: '#C62828' }} />}
        gradient="linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,235,238,0.95) 100%)"
        borderColor="#EF5350"
        valueColor="#C62828"
      />
    </Box>
  )
}
