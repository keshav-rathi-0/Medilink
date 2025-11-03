import React, { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Plus, Clock, User, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import Modal from '../components/common/Modal'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import * as appointmentService from '../services/appointmentService'
import * as patientService from '../services/patientService'
import * as doctorService from '../services/doctorService'
import { toast } from 'react-toastify'
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
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    startTime: '09:00',
    endTime: '09:30',
    type: 'Consultation',
    priority: 'Normal',
    symptoms: ''
  })

  useEffect(() => {
    fetchAppointments()
    fetchPatients()
    fetchDoctors()
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const response = await appointmentService.getAllAppointments()
      setAppointments(response.data || [])
    } catch (error) {
      console.error('Fetch appointments error:', error)
      toast.error('Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await patientService.getAllPatients()
      setPatients(response.data || [])
    } catch (error) {
      console.error('Fetch patients error:', error)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await doctorService.getAllDoctors()
      setDoctors(response.data || [])
    } catch (error) {
      console.error('Fetch doctors error:', error)
    }
  }

  const calculateEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const endMinutes = minutes + 30
    const endHours = endMinutes >= 60 ? hours + 1 : hours
    const finalMinutes = endMinutes >= 60 ? endMinutes - 60 : endMinutes
    return `${String(endHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`
  }

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.patientId || !formData.doctorId || !formData.appointmentDate || 
          !formData.startTime || !formData.endTime) {
        toast.error('Please fill in all required fields')
        return
      }

      const payload = {
        patient: formData.patientId,
        doctor: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        timeSlot: {
          startTime: formData.startTime,
          endTime: formData.endTime
        },
        type: formData.type,
        priority: formData.priority,
        symptoms: formData.symptoms
      }

      if (selectedAppointment) {
        await appointmentService.updateAppointment(selectedAppointment._id, payload)
        toast.success('Appointment updated successfully')
        setShowEditModal(false)
      } else {
        await appointmentService.createAppointment(payload)
        toast.success('Appointment booked successfully')
        setShowAddModal(false)
      }

      setFormData({
        patientId: '',
        doctorId: '',
        appointmentDate: '',
        startTime: '09:00',
        endTime: '09:30',
        type: 'Consultation',
        priority: 'Normal',
        symptoms: ''
      })
      setSelectedAppointment(null)
      fetchAppointments()
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentService.deleteAppointment(id)
        toast.success('Appointment deleted successfully')
        fetchAppointments()
      } catch (error) {
        console.error('Delete error:', error)
        toast.error('Failed to delete appointment')
      }
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentService.updateAppointmentStatus(id, status)
      toast.success(`Appointment ${status.toLowerCase()}`)
      fetchAppointments()
    } catch (error) {
      console.error('Status update error:', error)
      toast.error('Failed to update status')
    }
  }

  const handleCancel = async (id) => {
    const reason = window.prompt('Please enter cancellation reason:')
    if (reason) {
      try {
        await appointmentService.cancelAppointment(id, reason)
        toast.success('Appointment cancelled')
        fetchAppointments()
      } catch (error) {
        console.error('Cancel error:', error)
        toast.error('Failed to cancel appointment')
      }
    }
  }

  // Convert appointments to calendar events
  const events = appointments.map(apt => {
    const date = new Date(apt.appointmentDate)
    const [startHour, startMin] = apt.timeSlot.startTime.split(':').map(Number)
    const [endHour, endMin] = apt.timeSlot.endTime.split(':').map(Number)
    
    return {
      id: apt._id,
      title: `${apt.patient?.userId?.name || 'Patient'} - Dr. ${apt.doctor?.userId?.name || 'Doctor'}`,
      start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, startMin),
      end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour, endMin),
      resource: {
        type: apt.type,
        status: apt.status,
        appointment: apt
      }
    }
  })

  // Get upcoming appointments (next 7 days)
  const upcomingAppointments = appointments
    .filter(apt => {
      const aptDate = new Date(apt.appointmentDate)
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      return aptDate >= today && aptDate <= nextWeek && apt.status !== 'Cancelled' && apt.status !== 'Completed'
    })
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    .slice(0, 10)

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Scheduled':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'In-Progress':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'Completed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
      case 'Cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

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
          onClick={() => {
            setSelectedAppointment(null)
            setFormData({
              patientId: '',
              doctorId: '',
              appointmentDate: '',
              startTime: '09:00',
              endTime: '09:30',
              type: 'Consultation',
              priority: 'Normal',
              symptoms: ''
            })
            setShowAddModal(true)
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Appointments</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {appointments.length}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Today</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {appointments.filter(apt => {
                  const aptDate = new Date(apt.appointmentDate).toDateString()
                  const today = new Date().toDateString()
                  return aptDate === today
                }).length}
              </h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Confirmed</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {appointments.filter(apt => apt.status === 'Confirmed').length}
              </h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {appointments.filter(apt => apt.status === 'Scheduled').length}
              </h3>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
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
              onSelectEvent={(event) => {
                setSelectedAppointment(event.resource.appointment)
                setFormData({
                  patientId: event.resource.appointment.patient._id,
                  doctorId: event.resource.appointment.doctor._id,
                  appointmentDate: new Date(event.resource.appointment.appointmentDate).toISOString().split('T')[0],
                  startTime: event.resource.appointment.timeSlot.startTime,
                  endTime: event.resource.appointment.timeSlot.endTime,
                  type: event.resource.appointment.type,
                  priority: event.resource.appointment.priority || 'Normal',
                  symptoms: event.resource.appointment.symptoms || ''
                })
                setShowEditModal(true)
              }}
            />
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Upcoming Appointments
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-200 hover:bg-gray-50'} transition cursor-pointer`}
                  onClick={() => {
                    setSelectedAppointment(apt)
                    setFormData({
                      patientId: apt.patient._id,
                      doctorId: apt.doctor._id,
                      appointmentDate: new Date(apt.appointmentDate).toISOString().split('T')[0],
                      startTime: apt.timeSlot.startTime,
                      endTime: apt.timeSlot.endTime,
                      type: apt.type,
                      priority: apt.priority || 'Normal',
                      symptoms: apt.symptoms || ''
                    })
                    setShowEditModal(true)
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {apt.patient?.userId?.name || 'Patient'}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Dr. {apt.doctor?.userId?.name || 'Doctor'}</p>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-3 h-3" />
                      <span>{new Date(apt.appointmentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{apt.timeSlot.startTime}</span>
                    </div>
                  </div>
                  {apt.status === 'Scheduled' && (
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusChange(apt._id, 'Confirmed')
                        }}
                        className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCancel(apt._id)
                        }}
                        className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Appointment Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Book New Appointment"
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Patient *
            </label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              required
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.userId?.name} - {patient.patientId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Doctor *
            </label>
            <select
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.userId?.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Date *
            </label>
            <input
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Start Time *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => {
                  const endTime = calculateEndTime(e.target.value)
                  setFormData({ 
                    ...formData, 
                    startTime: e.target.value,
                    endTime: endTime
                  })
                }}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                End Time *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="Consultation">Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Emergency">Emergency</option>
              <option value="Surgery">Surgery</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Symptoms / Notes
            </label>
            <textarea
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              rows="3"
              placeholder="Enter symptoms or additional notes..."
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

      {/* Edit Appointment Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Appointment"
        size="lg"
      >
        <div className="space-y-4">
          {selectedAppointment && (
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Patient</p>
                  <p className="font-medium">{selectedAppointment.patient?.userId?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Doctor</p>
                  <p className="font-medium">Dr. {selectedAppointment.doctor?.userId?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                    {selectedAppointment.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500">Appointment ID</p>
                  <p className="font-medium">{selectedAppointment.appointmentId}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Date *
              </label>
              <input
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Start *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => {
                    const endTime = calculateEndTime(e.target.value)
                    setFormData({ 
                      ...formData, 
                      startTime: e.target.value,
                      endTime: endTime
                    })
                  }}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  End *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
              >
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Emergency">Emergency</option>
                <option value="Surgery">Surgery</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Symptoms / Notes
              </label>
              <textarea
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
                rows="3"
                placeholder="Enter symptoms or additional notes..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowEditModal(false)}
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
              Update Appointment
            </button>
          </div>

          {selectedAppointment && (
            <div className="flex space-x-2 pt-4 border-t dark:border-gray-700">
              {selectedAppointment.status === 'Scheduled' && (
                <>
                  <button
                    onClick={() => handleStatusChange(selectedAppointment._id, 'Confirmed')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm</span>
                  </button>
                  <button
                    onClick={() => handleCancel(selectedAppointment._id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </>
              )}
              {selectedAppointment.status === 'Confirmed' && (
                <>
                  <button
                    onClick={() => handleStatusChange(selectedAppointment._id, 'In-Progress')}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                  >
                    Start Appointment
                  </button>
                  <button
                    onClick={() => handleCancel(selectedAppointment._id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Cancel
                  </button>
                </>
              )}
              {selectedAppointment.status === 'In-Progress' && (
                <button
                  onClick={() => handleStatusChange(selectedAppointment._id, 'Completed')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Mark as Completed
                </button>
              )}
              <button
                onClick={() => handleDelete(selectedAppointment._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default Appointments