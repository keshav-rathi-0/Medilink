import React from 'react'
import { Bed, Users, Activity, AlertTriangle } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const WardStatus = ({ wards }) => {
  const { darkMode } = useTheme()

  const getOccupancyColor = (occupied, total) => {
    const percentage = (occupied / total) * 100
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getOccupancyBg = (occupied, total) => {
    const percentage = (occupied / total) * 100
    if (percentage >= 90) return 'from-red-600 to-pink-600'
    if (percentage >= 70) return 'from-yellow-600 to-orange-600'
    return 'from-green-600 to-emerald-600'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wards.map((ward) => (
        <div
          key={ward.id}
          className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 hover:shadow-lg transition`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {ward.name}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              ward.available > 5 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : ward.available > 0
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {ward.available} Available
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Department:</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {ward.department}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Floor:</span>
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {ward.floor}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Capacity:</span>
              <span className={`font-semibold ${getOccupancyColor(ward.occupied, ward.totalBeds)}`}>
                {ward.occupied}/{ward.totalBeds}
              </span>
            </div>
          </div>

          {/* Occupancy Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Occupancy</span>
              <span>{Math.round((ward.occupied / ward.totalBeds) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`bg-gradient-to-r ${getOccupancyBg(ward.occupied, ward.totalBeds)} h-2 rounded-full transition-all`}
                style={{ width: `${(ward.occupied / ward.totalBeds) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Bed className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500">Total</p>
              <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {ward.totalBeds}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Users className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-xs text-gray-500">Occupied</p>
              <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {ward.occupied}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Activity className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-500">Free</p>
              <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {ward.available}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default WardStatus