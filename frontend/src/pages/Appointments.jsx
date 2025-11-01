import React, { useState } from 'react'
import { Calendar as CalendarIcon, Plus, Clock, User } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import Modal from '../components/common/Modal'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'en-US': import('date-fns/locale/en-US')
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const Appointments = () => {
  const { darkMode } = useTheme()
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: '',
    date: '',
    time: '',
    type: '',
    notes: ''
  })

  const events = [
    {
      title: 'John Smith - Dr. Sarah Wilson',
      start: new Date(2024, 10, 31, 9, 0),
      end: new Date(2024, 10, 31, 9, 30),
      resource: { type: 'Consultation', status: 'Confirmed' }
    },
    {
      title: 'Emma Johnson - Dr. Michael Brown',
      start: new Date(2024, 10, 31, 10, 30),
      end: new Date(2024, 10, 31, 11, 0),
      resource: { type: 'Follow-up', status: 'Pending' }
    },
  ]

  const handleSubmit = () => {
    console.log('Appointment data:', formData)
    setShowAddModal(false)
    setFormData({
      patientName: '',
      doctorName: '',
      date: '',
      time: '',
      type: '',
      notes: ''
    })
  }

  const upcomingAppointments = [
    { id: 1, patient: 'John Smith', doctor: 'Dr. Sarah Wilson', date: '2024-10-31', time: '09:00 AM', type: 'Consultation', status: 'Confirmed' },
    { id: 2, patient: 'Emma Johnson', doctor: 'Dr. Michael Brown', date: '2024-10-31', time: '10:30 AM', type: 'Follow-up', status: 'Pending' },
    { id: 3, patient: 'Robert Davis', doctor: 'Dr. Emily Chen', date: '2024-11-01', time: '11:00 AM', type: 'Check-up', status: 'Confirmed' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Appointments
          </h1>
          <p className="text-gray-500 mt-1">Schedule and manage appointments</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Book Appointment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Appointment Calendar
          </h2>
          <div style={{ height: 600 }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              className={darkMode ? 'dark-calendar' : ''}
            />
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Upcoming Appointments
          </h2>
          <div className="space-y-3">
            {upcomingAppointments.map((apt) => (
              <div
                key={apt.id}
                className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-200 hover:bg-gray-50'} transition cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {apt.patient}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'Confirmed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-1">{apt.doctor}</p>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{apt.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{apt.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Book New Appointment"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Patient Name
            </label>
            <input
              type="text"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="Search or enter patient name"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Doctor
            </label>
            <select
              value={formData.doctorName}
              onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Doctor</option>
              <option value="Dr. Sarah Wilson">Dr. Sarah Wilson - Cardiology</option>
              <option value="Dr. Michael Brown">Dr. Michael Brown - Neurology</option>
              <option value="Dr. Emily Chen">Dr. Emily Chen - Orthopedics</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Time
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Appointment Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Type</option>
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="checkup">Check-up</option>
              <option value="surgery">Surgery</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              rows="3"
              placeholder="Additional notes or requirements"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowAddModal(false)}
            className={`px-6 py-2 rounded-lg border ${
              darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
            } transition`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
          >
            Book Appointment
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Appointments