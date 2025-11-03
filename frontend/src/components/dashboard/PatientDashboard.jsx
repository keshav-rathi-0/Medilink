import React, { useState } from 'react'
import { Calendar, FileText, DollarSign, Pill, Clock, MapPin, User, IndianRupee } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import StatCard from '../common/StatCard'

const PatientDashboard = () => {
  const { darkMode } = useTheme()

  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Dr. Kanan Goenka',
      specialization: 'Cardiology',
      date: '2024-11-05',
      time: '10:00 AM',
      location: 'Room 301, 3rd Floor',
      type: 'Follow-up'
    },
    {
      id: 2,
      doctor: 'Dr. Kanishk Doctor',
      specialization: 'Neurology',
      date: '2024-11-10',
      time: '02:30 PM',
      location: 'Room 205, 2nd Floor',
      type: 'Consultation'
    }
  ]

  const recentPrescriptions = [
    {
      id: 1,
      doctor: 'Dr. Kanishk Doctor',
      date: '2024-10-25',
      medicines: ['Paracetamol 500mg', 'Amoxicillin 250mg'],
      status: 'Active'
    },
  ]

  const recentBills = [
    {
      id: 1,
      billId: 'BILL-2024-001',
      date: '2024-10-25',
      amount: 450,
      status: 'Paid'
    },
    {
      id: 2,
      billId: 'BILL-2024-002',
      date: '2024-10-20',
      amount: 320,
      status: 'Pending'
    }
  ]

  const testResults = [
    {
      id: 1,
      testName: 'Complete Blood Count',
      date: '2024-10-28',
      status: 'Available',
      result: 'Normal'
    },
    {
      id: 2,
      testName: 'Lipid Profile',
      date: '2024-10-25',
      status: 'Available',
      result: 'Normal'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Patient Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your health overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Upcoming Appointments"
          value={upcomingAppointments.length}
          icon={Calendar}
          color="from-blue-600 to-cyan-600"
        />
        <StatCard
          title="Active Prescriptions"
          value={recentPrescriptions.filter(p => p.status === 'Active').length}
          icon={Pill}
          color="from-purple-600 to-pink-600"
        />
        <StatCard
          title="Pending Bills"
          value={recentBills.filter(b => b.status === 'Pending').length}
          icon={IndianRupee}
          color="from-orange-600 to-red-600"
        />
        <StatCard
          title="Test Results"
          value={testResults.length}
          icon={FileText}
          color="from-green-600 to-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Upcoming Appointments
          </h2>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {appointment.doctor}
                      </p>
                      <p className="text-sm text-gray-500">{appointment.specialization}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">
                    {appointment.type}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{appointment.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500 col-span-2">
                    <MapPin className="w-4 h-4" />
                    <span>{appointment.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Recent Prescriptions
          </h2>
          <div className="space-y-4">
            {recentPrescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {prescription.doctor}
                    </p>
                    <p className="text-sm text-gray-500">{prescription.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    prescription.status === 'Active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}>
                    {prescription.status}
                  </span>
                </div>
                <div className="space-y-1">
                  {prescription.medicines.map((medicine, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Pill className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600 dark:text-gray-400">{medicine}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Results */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Recent Test Results
          </h2>
          <div className="space-y-3">
            {testResults.map((test) => (
              <div
                key={test.id}
                className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-200 hover:bg-gray-50'} transition cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {test.testName}
                    </p>
                    <p className="text-sm text-gray-500">{test.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
                      {test.result}
                    </span>
                    <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Report
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bills */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Recent Bills
          </h2>
          <div className="space-y-3">
            {recentBills.map((bill) => (
              <div
                key={bill.id}
                className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {bill.billId}
                  </p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    bill.status === 'Paid'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {bill.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{bill.date}</p>
                  <p className="text-lg font-bold text-blue-600">${bill.amount}</p>
                </div>
                {bill.status === 'Pending' && (
                  <button className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                    Pay Now
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard