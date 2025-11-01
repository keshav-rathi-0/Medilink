import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTheme } from '../../context/ThemeContext'
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'

const AppointmentStats = ({ data }) => {
  const { darkMode } = useTheme()

  const stats = [
    {
      label: 'Total Appointments',
      value: data.reduce((acc, item) => acc + item.total, 0),
      icon: Calendar,
      color: 'from-blue-600 to-cyan-600'
    },
    {
      label: 'Completed',
      value: data.reduce((acc, item) => acc + item.completed, 0),
      icon: CheckCircle,
      color: 'from-green-600 to-emerald-600'
    },
    {
      label: 'Cancelled',
      value: data.reduce((acc, item) => acc + item.cancelled, 0),
      icon: XCircle,
      color: 'from-red-600 to-pink-600'
    },
    {
      label: 'Pending',
      value: data.reduce((acc, item) => acc + item.total - item.completed - item.cancelled, 0),
      icon: Clock,
      color: 'from-yellow-600 to-orange-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Appointment Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="completed" fill="#10b981" name="Completed" />
            <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default AppointmentStats