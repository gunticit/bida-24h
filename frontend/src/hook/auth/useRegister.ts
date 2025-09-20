import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiService, RegisterData } from '@/lib/api'

const useRegister = () => {
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.password_confirmation) {
      setError('Mật khẩu xác nhận không khớp')
      setLoading(false)
      return
    }

    try {
      const response = await apiService.register(formData)
      apiService.setToken(response.token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }
  return {
    formData,
    loading,
    error,
    handleChange,
    handleSubmit,
  }
}

export default useRegister
