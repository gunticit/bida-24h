import React from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'
import { formatCurrency } from '@/utils/formatters'

export const RevenueCard = ({ title, value, icon, color = 'primary', isMoney = false }: any) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="h2" color={color}>
            {isMoney ? formatCurrency(value) : value}
          </Typography>
        </Box>
        <Box color={`${color}.main`}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
)
