import React, { useState } from 'react'
import { Bed, Users, Activity, AlertTriangle, Plus, Filter } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const Wards = () => {
  const { darkMode } = useTheme()
  const [selectedWard, setSelectedWard] = useState('all')

  const wards = [
    {
      id: 1,
      name: 'General Ward A',
      totalBeds: 20,
      occupied: 15,
      available: 5,
      department: 'General Medicine',
      floor: '1st Floor'
    },
    {
      id: 2,
      name: 'ICU',
      totalBeds: 10,
      occupied: 8,
      available: 2,
      department: 'Critical Care',
      floor: '2nd Floor'
    },
    {
      id: 3,
      name: 'Pediatric Ward',
      totalBeds: 15,
      occupied: 10,
      available: 5,
      department: 'Pediatrics',
      floor: '3rd Floor'
    },
    {
      id: 4,
      name: 'Maternity Ward',
      totalBeds: 12,
      occupied: 7,
      available: 5,
      department: 'Gynecology',
      floor: '3rd Floor'
    }
  ]

  const beds = [
    {
      id: 'B101',
      ward: 'General Ward A',
      patient: 'John Smith',
      age: 45,
      gender: 'Male',
      admissionDate: '2024-10-25',
      condition: 'Stable',
      doctor: 'Dr. Sarah Wilson'
    },
    {
      id: 'B102',
      ward: 'General Ward A',
      patient: 'Emma Johnson',
      age: 32,
      gender: 'Female',
      admissionDate: '2024-10-28',
      condition: 'Critical',
      doctor: 'Dr. Michael Brown'
    },
    {
      id: 'B103',
      ward: 'General Ward A',
      patient: null,
      status: 'Available'
    },
    {
      id: 'B104',
      ward: 'General Ward A',
      patient: 'Robert Davis',
      age: 58,
      gender: 'Male',
      admissionDate: '2024-10-27',
      condition: 'Stable',
      doctor: 'Dr. Emily Chen'
    },
    {
      id: 'ICU01',
      ward: 'ICU',
      patient: 'Lisa Anderson',
      age: 67,
      gender: 'Female',
      admissionDate: '2024-10-29',
      condition: 'Critical',
      doctor: 'Dr. James Taylor'
    },
    {
      id: 'ICU02',
      ward: 'ICU',
      patient: null,
      status: 'Available'
    }
  ]

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Stable':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Ward & Bed Management
          </h1>
          <p className="text-gray-500 mt-1">Monitor ward status and bed occupancy in real-time</p>
        </div>
        <div className="flex space-x-3">
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
              darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
            } transition`}
          >
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Ward</span>
          </button>
        </div>
      </div>

      {/* Ward Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Beds</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {wards.reduce((acc, ward) => acc + ward.totalBeds, 0)}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bed className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className ="text-sm text-gray-500 font-medium">Occupied Beds</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {wards.reduce((acc, ward) => acc + ward.occupied, 0)}
              </h3>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Users className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Available Beds</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {wards.reduce((acc, ward) => acc + ward.available, 0)}
              </h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Occupancy Rate</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {Math.round((wards.reduce((acc, ward) => acc + ward.occupied, 0) / wards.reduce((acc, ward) => acc + ward.totalBeds, 0)) * 100)}%
              </h3>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Ward Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {wards.map((ward) => (
          <div
            key={ward.id}
            className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6 hover:shadow-lg transition cursor-pointer`}
            onClick={() => setSelectedWard(ward.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {ward.name}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                ward.available > 3 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {ward.available} Available
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Department:</span>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {ward.department}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Floor:</span>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {ward.floor}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Occupancy:</span>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {ward.occupied}/{ward.totalBeds}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all"
                  style={{ width: `${(ward.occupied / ward.totalBeds) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bed Status Grid */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Bed Status
          </h2>
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-500">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-500">Occupied - Stable</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-500">Occupied - Critical</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {beds.map((bed) => (
            <div
              key={bed.id}
              className={`p-4 rounded-lg border ${
                bed.patient
                  ? bed.condition === 'Critical'
                    ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                    : 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                  : 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Bed className={`w-5 h-5 ${
                    bed.patient
                      ? bed.condition === 'Critical'
                        ? 'text-red-600'
                        : 'text-blue-600'
                      : 'text-green-600'
                  }`} />
                  <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {bed.id}
                  </span>
                </div>
                {bed.patient && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(bed.condition)}`}>
                    {bed.condition}
                  </span>
                )}
              </div>

              {bed.patient ? (
                <div className="space-y-2 text-sm">
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {bed.patient}
                  </p>
                  <div className="flex justify-between text-gray-500">
                    <span>Age: {bed.age}</span>
                    <span>{bed.gender}</span>
                  </div>
                  <p className="text-gray-500">Doctor: {bed.doctor}</p>
                  <p className="text-xs text-gray-400">Admitted: {bed.admissionDate}</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-green-600 dark:text-green-400 font-semibold">Available</p>
                  <button className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition">
                    Assign Patient
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Wards