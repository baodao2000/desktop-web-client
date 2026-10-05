import axios from 'axios'

// Lấy API URL từ .env, mặc định là http://localhost:5000/api
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor (để tự động gắn JWT Token khi có đăng nhập)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor (xử lý lỗi chung)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi kết nối hoặc token hết hạn (401)
    if (error.response?.status === 401) {
      console.warn('Phiên đăng nhập đã hết hạn.')
    }
    return Promise.reject(error)
  }
)

/**
 * Kiểm tra kết nối tới Express Backend
 */
export async function checkServerHealth(): Promise<{ online: boolean; message: string; latency?: number }> {
  const startTime = Date.now()
  try {
    // Gửi request kiểm tra tới server
    // User có thể tạo route: app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
    const res = await apiClient.get('/movies', { timeout: 3000 })
    const latency = Date.now() - startTime
    return {
      online: true,
      message: res.data?.message || 'Server hoạt động bình thường',
      latency,
    }
  } catch (err: any) {
    return {
      online: false,
      message: err.message || 'Không thể kết nối đến Backend Server',
    }
  }
}
