import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, Users, UserPlus, Calendar, Bed, Pill, 
  DollarSign, BarChart3, Briefcase, Settings, 
  Activity, ChevronRight, LogOut 
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const { darkMode, sidebarOpen } = useTheme()
  const location = useLocation()

  const menuItems = {
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
      { id: 'patients', label: 'Patients', icon: Users, path: '/patients' },
      { id: 'doctors', label: 'Doctors', icon: UserPlus, path: '/doctors' },
      { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments' },
      { id: 'wards', label: 'Wards & Beds', icon: Bed, path: '/wards' },
      { id: 'pharmacy', label: 'Pharmacy', icon: Pill, path: '/pharmacy' },
      { id: 'billing', label: 'Billing', icon: DollarSign, path: '/billing' },
      { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
      { id: 'staff', label: 'Staff', icon: Briefcase, path: '/staff' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    ],
    doctor: [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
      { id: 'appointments', label: 'My Appointments', icon: Calendar, path: '/appointments' },
      { id: 'patients', label: 'Patients', icon: Users, path: '/patients' },
      { id: 'pharmacy', label: 'Prescriptions', icon: Pill, path: '/pharmacy' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    ],
    patient: [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
      { id: 'appointments', label: 'My Appointments', icon: Calendar, path: '/appointments' },
      { id: 'pharmacy', label: 'Prescriptions', icon: Pill, path: '/pharmacy' },
      { id: 'billing', label: 'My Bills', icon: DollarSign, path: '/billing' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    ]
  }

  const items = menuItems[user?.role] || menuItems.admin

  if (!sidebarOpen) return null

  return (
    <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} w-64 border-r min-h-screen transition-all duration-300 flex flex-col`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-2 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              MediCare
            </h1>
            <p className="text-xs text-gray-500">Hospital Management</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1 flex-1 overflow-y-auto scrollbar-hide">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : darkMode
                  ? 'text-gray-300 hover:bg-gray-800'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      <div className={`p-4 border-t ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <div className={`flex items-center space-x-3 p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-50 to-cyan-50'}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-semibold">
            {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </div>
          <div className="flex-1">
            <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role || 'user'}</p>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-red-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar