import React from 'react'
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const PaymentTracker = ({ payments }) => {
  const { darkMode } = useTheme()

  const getTotalRevenue = () => {
    return payments.reduce((total, payment) => total + payment.amount, 0)
  }

  const getPaymentsByMethod = () => {
    const methods = {}
    payments.forEach(payment => {
      if (methods[payment.method]) {
        methods[payment.method] += payment.amount
      } else {
        methods[payment.method] = payment.amount
      }
    })
    return methods
  }

  const paymentMethods = getPaymentsByMethod()

  const getMethodColor = (method) => {
    const colors = {
      cash: 'from-green-600 to-emerald-600',
      'credit card': 'from-blue-600 to-cyan-600',
      'debit card': 'from-purple-600 to-pink-600',
      insurance: 'from-orange-600 to-red-600',
      'bank transfer': 'from-indigo-600 to-purple-600'
    }
    return colors[method.toLowerCase()] || 'from-gray-600 to-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                ${getTotalRevenue().toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Payments</p>
              <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {payments.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Payment</p>
              <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                ${(getTotalRevenue() / payments.length).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingDown className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className={`p-6 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Payment by Method
        </h3>
        <div className="space-y-4">
          {Object.entries(paymentMethods).map(([method, amount]) => (
            <div key={method}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium capitalize ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {method}
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  ${amount.toLocaleString()} ({((amount / getTotalRevenue()) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`bg-gradient-to-r ${getMethodColor(method)} h-2 rounded-full transition-all`}
                  style={{ width: `${(amount / getTotalRevenue()) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Payments */}
      <div className={`p-6 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Recent Payments
        </h3>
        <div className="space-y-3">
          {payments.slice(0, 10).map((payment, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg flex items-center justify-between ${
                darkMode ? 'bg-gray-750' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${getMethodColor(payment.method)}`}>
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {payment.patient}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{payment.method}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">
                  +${payment.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{payment.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PaymentTracker