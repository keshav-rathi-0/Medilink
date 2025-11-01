import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const StatCard = ({ title, value, change, icon: Icon, trend, color }) => {
  const { darkMode } = useTheme()
  const isPositive = trend === 'up'

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 hover:shadow-lg transition-all`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h3 className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {value}
          </h3>
          {change && (
            <div className="flex items-center mt-3 space-x-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {change}
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

export default StatCard