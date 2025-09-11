import React from 'react'
import { Card, CardContent, Typography, Box } from '@mui/material'

interface StatisticsCardsProps {
  sessions: Array<{ status: string }>
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ sessions }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 3,
        mb: 3,
      }}
    >
      <Card>
        <CardContent>
          <Typography color="textSecondary" gutterBottom>
            Tổng số Session
          </Typography>
          <Typography variant="h4">{sessions.length}</Typography>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography color="textSecondary" gutterBottom>
            Đang chơi
          </Typography>
          <Typography variant="h4" color="primary">
            {sessions.filter((s) => s.status === 'playing').length}
          </Typography>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography color="textSecondary" gutterBottom>
            Đã kết thúc
          </Typography>
          <Typography variant="h4" color="success.main">
            {sessions.filter((s) => s.status === 'finished').length}
          </Typography>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography color="textSecondary" gutterBottom>
            Đã hủy
          </Typography>
          <Typography variant="h4" color="error.main">
            {sessions.filter((s) => s.status === 'canceled').length}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
