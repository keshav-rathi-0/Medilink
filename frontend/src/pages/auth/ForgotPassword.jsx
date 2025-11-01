import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, ArrowLeft } from 'lucide-react'
import { toast } from 'react-toastify'
import * as authService from '../../services/authService'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setEmailSent(true)
      toast.success('Password reset link sent to your email')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white">
          <div className="flex items-center justify-center mb-4">
            <Activity className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-bold text-center">Forgot Password</h1>
          <p className="text-center text-blue-100 mt-2">Reset your account password</p>
        </div>
        
        <div className="p-8">
          {!emailSent ? (
            <>
              <p className="text-gray-600 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Check Your Email</h3>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <Link
                to="/login"
                className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition"
              >
                Back to Login
              </Link>
            </div>
          )}
          
          {!emailSent && (
            <div className="mt-6">
              <Link to="/login" className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword