import React from 'react'
import { Calendar, Users, Phone, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import StatCard from '../common/StatCard'

const ReceptionistDashboard = () => {
  const { darkMode } = useTheme()

  const todayAppointments = [
    {
      id: 1,
      time: '09:00 AM',
      patient: 'Kanishk New',
      doctor: 'Dr. Kanan Goenka',
      type: 'Consultation',
      status: 'Checked In'
    },
    {
      id: 2,
      time: '09:30 AM',
      patient: 'Keshav Patient',
      doctor: 'Dr. Kanishk Gandecha',
      type: 'Follow-up',
      status: 'Waiting'
    },
    {
      id: 3,
      time: '10:00 AM',
      patient: 'Kanishk Gandecha',
      doctor: 'Dr. Kanan Goenka',
      type: 'Check-up',
      status: 'Scheduled'
    },
    {
      id: 4,
      time: '10:30 AM',
      patient: 'Kanan Patient',
      doctor: 'Dr. Kanishk Gandecha',
      type: 'Consultation',
      status: 'Scheduled'
    }
  ]

  const checkIns = [
    { id: 1, patient: 'Kanishk New', time: '08:55 AM', doctor: 'Dr. Sarah Wilson' },
    { id: 2, patient: 'Keshav Patient', time: '09:15 AM', doctor: 'Dr. Emily Chen' }
  ]

  const pendingCalls = [
    { id: 1, caller: 'Kanishk Gandecha', reason: 'Appointment Booking', time: '5 min ago' },
    { id: 2, caller: 'Kanan Patient', reason: 'Report Inquiry', time: '10 min ago' },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Checked In':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Waiting':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'Completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Receptionist Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Manage appointments and patient check-ins</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Appointments"
          value={todayAppointments.length}
          icon={Calendar}
          color="from-blue-600 to-cyan-600"
        />
        <StatCard
          title="Checked In"
          value={todayAppointments.filter(a => a.status === 'Checked In').length}
          icon={CheckCircle}
          color="from-green-600 to-emerald-600"
        />
        <StatCard
          title="Pending Calls"
          value={pendingCalls.length}
          icon={Phone}
          color="from-orange-600 to-red-600"
        />
        <StatCard
          title="Walk-ins Today"
          value="8"
          icon={Users}
          color="from-purple-600 to-pink-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Today's Appointments
            </h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              New Appointment
            </button>
          </div>
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {appointment.patient}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.time} • {appointment.doctor}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    {appointment.status === 'Scheduled' && (
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Check In
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Recent Check-ins */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Recent Check-ins
            </h2>
            <div className="space-y-3">
              {checkIns.map((checkIn) => (
                <div
                  key={checkIn.id}
                  className={`p-3 rounded-lg ${darkMode ? 'bg-gray-750' : 'bg-green-50'}`}
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {checkIn.patient}
                      </p>
                      <p className="text-xs text-gray-500">{checkIn.doctor}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-7">{checkIn.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Calls */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Pending Calls
            </h2>
            <div className="space-y-3">
              {pendingCalls.map((call) => (
                <div
                  key={call.id}
                  className={`p-3 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className="flex items-start space-x-2">
                    <Phone className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {call.caller}
                      </p>
                      <p className="text-xs text-gray-500">{call.reason}</p>
                      <p className="text-xs text-gray-400 mt-1">{call.time}</p>
                    </div>
                  </div>
                  <button className="mt-2 w-full py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 transition">
                    Call Back
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReceptionistDashboard