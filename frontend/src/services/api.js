import axios from 'axios'

// ✅ Determine if we're in development or production
const isDevelopment = import.meta.env.MODE === 'development'

// ✅ Use local backend in development, deployed backend in production
const API_URL = isDevelopment 
  ? 'http://localhost:5001'  // Change 5000 to your backend port
  : (import.meta.env.VITE_BACKEND_URL || 'https://medilink-oajt.onrender.com')

// Debug: show what the app is using
console.info('🌐 Environment:', import.meta.env.MODE)
console.info('🔗 API base URL:', API_URL)

// ✅ Axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ✅ Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// ✅ Response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status)
    return response.data
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })

    // Network error (can't reach server)
    if (!error.response) {
      console.error('🚫 NETWORK ERROR: Cannot reach backend at', API_URL)
      console.error('Make sure:')
      console.error('1. Backend server is running')
      console.error('2. Backend URL is correct')
      console.error('3. CORS is enabled on backend')
      
      // Create a more helpful error message
      error.message = `Cannot connect to server at ${API_URL}. Is the backend running?`
    }

    // 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn('⚠️ Unauthorized - redirecting to login')
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api