import React, { useState } from 'react'
import { Calendar, Users, Clock, FileText } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import StatCard from '../common/StatCard'

const DoctorDashboard = () => {
  const { darkMode } = useTheme()

  const todayAppointments = [
    { id: 1, patient: 'John Smith', time: '09:00 AM', type: 'Consultation', status: 'Upcoming' },
    { id: 2, patient: 'Emma Wilson', time: '10:30 AM', type: 'Follow-up', status: 'Upcoming' },
    { id: 3, patient: 'Michael Brown', time: '02:00 PM', type: 'Check-up', status: 'Completed' },
  ]

  const recentPatients = [
    { id: 1, name: 'Sarah Johnson', lastVisit: '2 days ago', diagnosis: 'Hypertension' },
    { id: 2, name: 'David Lee', lastVisit: '5 days ago', diagnosis: 'Diabetes Type 2' },
    { id: 3, name: 'Lisa Anderson', lastVisit: '1 week ago', diagnosis: 'Migraine' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Doctor Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Manage your appointments and patients</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Appointments"
          value="8"
          icon={Calendar}
          color="from-blue-600 to-cyan-600"
        />
        <StatCard
          title="Total Patients"
          value="145"
          icon={Users}
          color="from-purple-600 to-pink-600"
        />
        <StatCard
          title="Pending Prescriptions"
          value="12"
          icon={FileText}
          color="from-green-600 to-emerald-600"
        />
        <StatCard
          title="On-Call Hours"
          value="6h"
          icon={Clock}
          color="from-orange-600 to-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Today's Appointments
          </h2>
          <div className="space-y-4">
            {todayAppointments.map((apt) => (
              <div
                key={apt.id}
                className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {apt.patient}
                    </p>
                    <p className="text-sm text-gray-500">{apt.type}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {apt.time}
                    </p>
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === 'Completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
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
            Recent Patients
          </h2>
          <div className="space-y-4">
            {recentPatients.map((patient) => (
              <div
                key={patient.id}
                className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} cursor-pointer hover:shadow-md transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-semibold">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {patient.name}
                      </p>
                      <p className="text-sm text-gray-500">{patient.diagnosis}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{patient.lastVisit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard