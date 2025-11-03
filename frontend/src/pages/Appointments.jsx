import React, { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Plus, Clock, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import TableComponent from '../components/common/TableComponent'
import Modal from '../components/common/Modal'
import * as appointmentService from '../services/appointmentService'
import * as patientService from '../services/patientService'
import * as doctorService from '../services/doctorService'
import { toast } from 'react-toastify'

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
      toast.error('Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await patientService.getAllPatients()
      setPatients(response.data || response.patients || [])
    } catch (error) {
      toast.error('Failed to fetch patients')
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await doctorService.getAllDoctors()
      setDoctors(response.data || [])
    } catch (error) {
      toast.error('Failed to fetch doctors')
    }
  }

  const calculateEndTime = (startTime) => {
    const [h, m] = startTime.split(':').map(Number)
    const total = h * 60 + m + 30
    const endH = Math.floor(total / 60) % 24
    const endM = total % 60
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
  }

  const handleSubmit = async () => {
    try {
      if (!formData.patientId || !formData.doctorId || !formData.appointmentDate) {
        toast.error('Please fill in all required fields')
        return
      }

      const payload = {
        patient: formData.patientId,
        doctor: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        timeSlot: { startTime: formData.startTime, endTime: formData.endTime },
        type: formData.type,
        priority: formData.priority,
        symptoms: formData.symptoms,
        notes: formData.symptoms
      }

      if (selectedAppointment) {
        await appointmentService.updateAppointment(selectedAppointment._id, payload)
        toast.success('Appointment updated successfully')
      } else {
        await appointmentService.createAppointment(payload)
        toast.success('Appointment booked successfully')
      }

      resetForm()
      setShowAddModal(false)
      setShowEditModal(false)
      fetchAppointments()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentService.updateAppointmentStatus(id, status)
      toast.success(`Appointment marked as ${status}`)
      fetchAppointments()
    } catch (error) {
      toast.error('Failed to update appointment status')
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
        toast.error('Failed to cancel appointment')
      }
    }
  }

  const resetForm = () => {
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
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Scheduled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'Cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'Completed': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
      case 'In-Progress': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'No-Show': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const columns = [
    { header: 'ID', accessor: 'appointmentId', render: (r) => <span className="font-mono text-sm">{r.appointmentId}</span> },
    {
      header: 'Patient',
      accessor: 'patient',
      render: (r) => (
        <div>
          <p className="font-medium">{r.patient?.userId?.name || 'N/A'}</p>
          <p className="text-xs text-gray-500">{r.patient?.patientId || ''}</p>
        </div>
      )
    },
    {
      header: 'Doctor',
      accessor: 'doctor',
      render: (r) => (
        <div>
          <p className="font-medium">Dr. {r.doctor?.userId?.name || 'N/A'}</p>
          <p className="text-xs text-gray-500">{r.doctor?.specialization || ''}</p>
        </div>
      )
    },
    {
      header: 'Date & Time',
      accessor: 'appointmentDate',
      render: (r) => (
        <div>
          <p className="font-medium">{new Date(r.appointmentDate).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">{r.timeSlot?.startTime} - {r.timeSlot?.endTime}</p>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(r.status)}`}>
          {r.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (r) => (
        <div className="flex space-x-2">
          {r.status !== 'Completed' && r.status !== 'Cancelled' && (
            <>
              <button
                onClick={() => {
                  setSelectedAppointment(r)
                  setFormData({
                    patientId: r.patient?._id || '',
                    doctorId: r.doctor?._id || '',
                    appointmentDate: new Date(r.appointmentDate).toISOString().split('T')[0],
                    startTime: r.timeSlot?.startTime || '09:00',
                    endTime: r.timeSlot?.endTime || '09:30',
                    type: r.type || 'Consultation',
                    priority: r.priority || 'Normal',
                    symptoms: r.symptoms || ''
                  })
                  setShowEditModal(true)
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStatusUpdate(r._id, 'Completed')}
                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                title="Mark as Completed"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCancel(r._id)}
                className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg"
                title="Cancel Appointment"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          {(r.status === 'Completed' || r.status === 'Cancelled') && (
            <span className="text-xs text-gray-500 px-2 py-1">
              No actions available
            </span>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Appointments
          </h1>
          <p className="text-gray-500 mt-1">Manage patient appointments and schedules</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowAddModal(true)
          }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Book Appointment
        </button>
      </div>

      <TableComponent columns={columns} data={appointments} searchPlaceholder="Search appointments..." />

      {/* Add Appointment Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); resetForm(); }} title="Book Appointment" size="lg">
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Select Patient *
            </label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
              required
            >
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p._id} value={p._id}>
                  {p.userId?.name} - {p.patientId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Select Doctor *
            </label>
            <select
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>
                  Dr. {d.userId?.name} - {d.specialization}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Appointment Date *
            </label>
            <input
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
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
                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
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
                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Symptoms / Reason
            </label>
            <textarea
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
              rows="3"
              placeholder="Enter symptoms or reason for appointment..."
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => { setShowAddModal(false); resetForm(); }}
              className={`px-6 py-2 rounded-lg border ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} transition`}
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
        </div>
      </Modal>

      {/* Edit Appointment Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); resetForm(); }} title="Edit Appointment" size="lg">
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Select Patient *
            </label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
              required
            >
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p._id} value={p._id}>
                  {p.userId?.name} - {p.patientId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Select Doctor *
            </label>
            <select
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>
                  Dr. {d.userId?.name} - {d.specialization}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Appointment Date *
            </label>
            <input
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
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
                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
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
                className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Symptoms / Reason
            </label>
            <textarea
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-500`}
              rows="3"
              placeholder="Enter symptoms or reason for appointment..."
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => { setShowEditModal(false); resetForm(); }}
              className={`px-6 py-2 rounded-lg border ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'} transition`}
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
        </div>
      </Modal>
    </div>
  )
}

export default Appointments