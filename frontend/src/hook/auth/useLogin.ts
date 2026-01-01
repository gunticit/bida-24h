import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiService, LoginCredentials } from '@/lib/api'

const useLogin = () => {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(true)
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

    try {
      const response = await apiService.login(formData)

      if (response.token) {
        apiService.setToken(response.token)
        router.push('/dashboard')
      } else {
        setError('Không nhận được token từ server')
      }
    } catch (err) {
      let message = 'Đăng nhập thất bại'
      if (
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as Record<string, unknown>).message === 'string'
      ) {
        message = (err as { message: string }).message
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }
  return {
    formData,
    loading,
    error,
    setLoading,
    handleChange,
    handleSubmit,
  }
}

export default useLogin
