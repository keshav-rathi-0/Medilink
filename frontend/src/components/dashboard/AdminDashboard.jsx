import React, { useEffect, useState } from 'react'
import { Users, Calendar, Bed, DollarSign, Activity, TrendingUp } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import StatCard from '../common/StatCard'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const AdminDashboard = () => {
  const { darkMode } = useTheme()
  const [stats, setStats] = useState({
    totalPatients: 2845,
    appointmentsToday: 124,
    availableBeds: 45,
    revenueToday: 12450
  })

  const recentAppointments = [
    { id: 1, patient: 'John Smith', doctor: 'Dr. Sarah Wilson', time: '09:00 AM', status: 'Confirmed', type: 'Consultation' },
    { id: 2, patient: 'Emma Johnson', doctor: 'Dr. Michael Brown', time: '10:30 AM', status: 'Pending', type: 'Follow-up' },
    { id: 3, patient: 'Robert Davis', doctor: 'Dr. Emily Chen', time: '11:00 AM', status: 'Confirmed', type: 'Surgery' },
    { id: 4, patient: 'Lisa Anderson', doctor: 'Dr. James Taylor', time: '02:00 PM', status: 'Confirmed', type: 'Check-up' },
  ]

  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ]

  const departmentData = [
    { name: 'Cardiology', patients: 45, color: '#ef4444' },
    { name: 'Neurology', patients: 32, color: '#8b5cf6' },
    { name: 'Orthopedics', patients: 28, color: '#3b82f6' },
    { name: 'Pediatrics', patients: 52, color: '#10b981' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Dashboard Overview
        </h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients.toLocaleString()}
          change="+12.5%"
          trend="up"
          icon={Users}
          color="from-blue-600 to-cyan-600"
        />
        <StatCard
          title="Appointments Today"
          value={stats.appointmentsToday}
          change="+8.2%"
          trend="up"
          icon={Calendar}
          color="from-purple-600 to-pink-600"
        />
        <StatCard
          title="Available Beds"
          value={stats.availableBeds}
          change="-5.3%"
          trend="down"
          icon={Bed}
          color="from-green-600 to-emerald-600"
        />
        <StatCard
          title="Revenue (Today)"
          value={`$${stats.revenueToday.toLocaleString()}`}
          change="+15.8%"
          trend="up"
          icon={DollarSign}
          color="from-orange-600 to-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Recent Appointments
            </h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentAppointments.map((apt) => (
              <div
                key={apt.id}
                className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-semibold">
                      {apt.patient.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {apt.patient}
                      </p>
                      <p className="text-sm text-gray-500">{apt.doctor}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {apt.time}
                    </p>
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === 'Confirmed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Department Overview
          </h2>
          <div className="space-y-4">
            {departmentData.map((dept, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {dept.name}
                  </span>
                  <span className="text-sm font-semibold text-blue-600">{dept.patients}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ 
                      width: `${(dept.patients / 60) * 100}%`,
                      background: dept.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Revenue Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
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
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Patient Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="patients"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard