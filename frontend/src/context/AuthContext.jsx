import React, { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as authService from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await authService.verifyToken()
        console.log('✅ Token verification response:', response)
        
        // Handle different response structures
        const userData = response.user || response.data || response
        
        if (userData && userData.role) {
          setUser(userData)
        } else {
          console.warn('⚠️ Invalid user data structure:', response)
          localStorage.removeItem('token')
          setUser(null)
        }
      }
    } catch (error) {
      console.error('❌ Auth verification failed:', error)
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      console.log('🔐 Attempting login...')
      const response = await authService.login(credentials)
      console.log('✅ Login response:', response)
      
      // Handle token
      if (response.token) {
        localStorage.setItem('token', response.token)
      } else {
        throw new Error('No token received from server')
      }
      
      // Handle user data - try different response structures
      const userData = response.user || response.data || response
      
      if (!userData || !userData.role) {
        throw new Error('Invalid user data received from server')
      }
      
      setUser(userData)
      toast.success(`Welcome back, ${userData.name || 'User'}!`)
      navigate('/dashboard')
      return response
    } catch (error) {
      console.error('❌ Login error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Login failed'
      toast.error(errorMessage)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration...')
      console.log('📤 Registration data:', { ...userData, password: '[HIDDEN]' })
      
      const response = await authService.register(userData)
      console.log('✅ Registration response:', response)
      
      // Check if registration was successful
      if (response.success === false) {
        throw new Error(response.message || 'Registration failed')
      }
      
      toast.success('Registration successful! Please login.')
      
      // Optional: Auto-login if token is provided
      if (response.token) {
        localStorage.setItem('token', response.token)
        const user = response.user || response.data
        if (user && user.role) {
          setUser(user)
          navigate('/dashboard')
          return response
        }
      }
      
      // Otherwise navigate to login
      navigate('/login')
      return response
    } catch (error) {
      console.error('❌ Registration error:', error)
      console.error('Error details:', {
        response: error.response?.data,
        message: error.message,
        status: error.response?.status
      })
      
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed'
      toast.error(errorMessage)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.info('Logged out successfully')
    navigate('/login')
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}