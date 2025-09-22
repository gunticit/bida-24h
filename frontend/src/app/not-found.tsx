'use client'

import { useState, useEffect } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useRouter } from 'next/navigation'
import Error404 from '@/components/error-404'
import { Box, Button, Typography } from '@mui/material'

export default function NotFound() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const handleBackHome = () => {
    router.push('/dashboard')
  }
  useEffect(() => {
    setLoading(false)
  }, [])
  if (loading) {
    return <Error404 />
  }
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
        Trang tìm kiếm không tồn tại
      </Typography>
      <Box>
        <DotLottieReact src="/error-404.lottie" loop autoplay />
      </Box>
      <Typography>Vui lòng thử lại hoặc trở về bảng điều khiển để tiếp tục thao tác</Typography>
      <Button onClick={handleBackHome} variant="outlined" sx={{ mt: 2 }}>
        Bảng điều khiển
      </Button>
    </Box>
  )
}
