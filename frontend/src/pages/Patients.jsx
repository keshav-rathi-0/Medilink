import React, { useState, useEffect } from 'react'
import { Plus, Edit, Eye, Trash2, Download, Filter, FileText, Calendar, Activity } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import TableComponent from '../components/common/TableComponent'
import Modal from '../components/common/Modal'
import * as patientService from '../services/patientService'
import * as appointmentService from '../services/appointmentService'
import * as doctorService from '../services/doctorService'
import { toast } from 'react-toastify'

const Patients = () => {
  const { darkMode } = useTheme()
  const [patients, setPatients] = useState([])
  const [availableUsers, setAvailableUsers] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showMedicalModal, setShowMedicalModal] = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [medicalRecords, setMedicalRecords] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [formData, setFormData] = useState({
    userId: '',
    bloodGroup: '',
    emergencyContact: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    allergies: []
  })
  const [appointmentData, setAppointmentData] = useState({
    doctorId: '',
    appointmentDate: '',
    startTime: '09:00',
    endTime: '09:30',
    reason: '',
    type: 'Consultation',
    priority: 'Normal'
  })

  useEffect(() => {
    fetchPatients()
    fetchAvailableUsers()
    fetchDoctors()
  }, [])

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const data = await patientService.getAllPatients()
      setPatients(data.data || data.patients || [])
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to fetch patients')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableUsers = async () => {
    try {
      const data = await patientService.getAvailablePatientUsers()
      setAvailableUsers(data.data || [])
    } catch (error) {
      console.error('Fetch users error:', error)
    }
  }

  const fetchDoctors = async () => {
    try {
      const data = await doctorService.getAllDoctors()
      setDoctors(data.data || [])
    } catch (error) {
      console.error('Fetch doctors error:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      if (selectedPatient) {
        await patientService.updatePatient(selectedPatient._id, formData)
        toast.success('Patient updated successfully')
      } else {
        await patientService.createPatient(formData)
        toast.success('Patient profile created successfully')
        fetchAvailableUsers()
      }
      
      setShowAddModal(false)
      setFormData({
        userId: '',
        bloodGroup: '',
        emergencyContact: '',
        emergencyContactName: '',
        emergencyContactRelation: '',
        allergies: []
      })
      setSelectedPatient(null)
      fetchPatients()
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(error.response?.data?.message || error.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientService.deletePatient(id)
        toast.success('Patient deleted successfully')
        fetchPatients()
        fetchAvailableUsers()
      } catch (error) {
        console.error('Delete error:', error)
        toast.error('Failed to delete patient')
      }
    }
  }

  const viewMedicalRecords = async (patient) => {
    try {
      const data = await patientService.getPatientMedicalRecords(patient._id)
      setMedicalRecords(data.data)
      setSelectedPatient(patient)
      setShowMedicalModal(true)
    } catch (error) {
      toast.error('Failed to fetch medical records')
    }
  }

  const viewAppointments = async (patient) => {
    try {
      const data = await appointmentService.getPatientAppointments(patient._id)
      setAppointments(data.data || [])
      setSelectedPatient(patient)
      setShowViewModal(true)
    } catch (error) {
      toast.error('Failed to fetch appointments')
    }
  }

  const handleCreateAppointment = async () => {
    try {
      // Validate required fields
      if (!appointmentData.doctorId || !appointmentData.appointmentDate || 
          !appointmentData.startTime || !appointmentData.endTime) {
        toast.error('Please fill in all required fields')
        return
      }

      // Prepare payload according to API requirements
      const payload = {
        patient: selectedPatient._id,
        doctor: appointmentData.doctorId,
        appointmentDate: appointmentData.appointmentDate,
        timeSlot: {
          startTime: appointmentData.startTime,
          endTime: appointmentData.endTime
        },
        type: appointmentData.type,
        priority: appointmentData.priority,
        symptoms: appointmentData.reason,
        notes: appointmentData.reason
      }
      
      const response = await appointmentService.createAppointment(payload)
      toast.success('Appointment scheduled successfully')
      setShowAppointmentModal(false)
      setAppointmentData({
        doctorId: '',
        appointmentDate: '',
        startTime: '09:00',
        endTime: '09:30',
        reason: '',
        type: 'Consultation',
        priority: 'Normal'
      })
    } catch (error) {
      console.error('Appointment creation error:', error)
      toast.error(error.response?.data?.message || 'Failed to create appointment')
    }
  }

  const calculateEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const endMinutes = minutes + 30
    const endHours = endMinutes >= 60 ? hours + 1 : hours
    const finalMinutes = endMinutes >= 60 ? endMinutes - 60 : endMinutes
    return `${String(endHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`
  }

  const columns = [
    { header: 'Patient ID', accessor: 'patientId' },
    { 
      header: 'Name', 
      accessor: 'name',
      render: (row) => row.userId?.name || 'N/A'
    },
    { 
      header: 'Age', 
      accessor: 'age',
      render: (row) => {
        const dob = row.userId?.dateOfBirth
        if (!dob) return 'N/A'
        const age = new Date().getFullYear() - new Date(dob).getFullYear()
        return age
      }
    },
    { 
      header: 'Gender', 
      accessor: 'gender',
      render: (row) => row.userId?.gender || 'N/A'
    },
    { header: 'Blood Group', accessor: 'bloodGroup' },
    { 
      header: 'Phone', 
      accessor: 'phone',
      render: (row) => row.userId?.phone || 'N/A'
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => viewMedicalRecords(row)}
            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
            title="View Medical Records"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => viewAppointments(row)}
            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition"
            title="View Appointments"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedPatient(row)
              setAppointmentData({
                doctorId: '',
                appointmentDate: '',
                startTime: '09:00',
                endTime: '09:30',
                reason: '',
                type: 'Consultation',
                priority: 'Normal'
              })
              setShowAppointmentModal(true)
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
            title="Add Appointment"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedPatient(row)
              setFormData({
                userId: row.userId?._id || '',
                bloodGroup: row.bloodGroup || '',
                emergencyContact: row.emergencyContact?.phone || '',
                emergencyContactName: row.emergencyContact?.name || '',
                emergencyContactRelation: row.emergencyContact?.relation || '',
                allergies: row.allergies || []
              })
              setShowAddModal(true)
            }}
            className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Patient Management
          </h1>
          <p className="text-gray-500 mt-1">Manage patient records and information</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setSelectedPatient(null)
              setFormData({
                userId: '',
                bloodGroup: '',
                emergencyContact: '',
                emergencyContactName: '',
                emergencyContactRelation: '',
                allergies: []
              })
              setShowAddModal(true)
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Patient Profile</span>
          </button>
        </div>
      </div>

      <TableComponent
        columns={columns}
        data={patients}
        searchPlaceholder="Search patients by name, ID, or phone..."
      />

      {/* Add/Edit Patient Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={selectedPatient ? 'Edit Patient' : 'Add Patient Profile'}
        size="lg"
      >
        <div className="space-y-4">
          {!selectedPatient && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Select Patient User
              </label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select a registered patient user...</option>
                {availableUsers.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Blood Group
            </label>
            <select
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Emergency Contact Name
            </label>
            <input
              type="text"
              value={formData.emergencyContactName}
              onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter emergency contact name"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Emergency Contact Phone
            </label>
            <input
              type="tel"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter emergency contact number"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Relation
            </label>
            <input
              type="text"
              value={formData.emergencyContactRelation}
              onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., Spouse, Parent, Sibling"
            />
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
              {selectedPatient ? 'Update' : 'Add'} Patient
            </button>
          </div>
        </div>
      </Modal>

      {/* Medical Records Modal */}
      <Modal
        isOpen={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
        title="Medical Records"
        size="xl"
      >
        {medicalRecords && (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className="font-semibold mb-2">Patient Information</h3>
              <p>Patient ID: {medicalRecords.patientId}</p>
              <p>Name: {medicalRecords.userId?.name}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Medical History</h3>
              {medicalRecords.medicalHistory?.length > 0 ? (
                <div className="space-y-2">
                  {medicalRecords.medicalHistory.map((item, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className="font-medium">{item.condition}</p>
                      <p className="text-sm text-gray-500">
                        Diagnosed: {new Date(item.diagnosedDate).toLocaleDateString()} - Status: {item.status}
                      </p>
                      {item.notes && <p className="text-sm mt-1">{item.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No medical history recorded</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-3">Lab Reports</h3>
              {medicalRecords.labReports?.length > 0 ? (
                <div className="space-y-2">
                  {medicalRecords.labReports.map((item, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className="font-medium">{item.testName}</p>
                      <p className="text-sm text-gray-500">Date: {new Date(item.testDate).toLocaleDateString()}</p>
                      <p className="text-sm mt-1">Results: {item.results}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No lab reports available</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-3">Allergies</h3>
              {medicalRecords.allergies?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {medicalRecords.allergies.map((allergy, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No allergies recorded</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Appointments Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Patient Appointments"
        size="lg"
      >
        <div className="space-y-4">
          {appointments.length > 0 ? (
            appointments.map((apt, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Dr. {apt.doctor?.userId?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{apt.doctor?.specialization}</p>
                    <p className="text-sm mt-2">
                      {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.timeSlot?.startTime}
                    </p>
                    <p className="text-sm">Reason: {apt.symptoms || apt.notes || 'N/A'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    apt.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    apt.status === 'Confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    apt.status === 'Completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No appointments found</p>
          )}
        </div>
      </Modal>

      {/* Add Appointment Modal */}
      <Modal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        title={`Schedule Appointment - ${selectedPatient?.userId?.name || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Select Doctor *
            </label>
            <select
              value={appointmentData.doctorId}
              onChange={(e) => setAppointmentData({ ...appointmentData, doctorId: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              required
            >
              <option value="">Select a doctor...</option>
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.userId?.name} - {doctor.specialization} (₹{doctor.consultationFee})
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
              value={appointmentData.appointmentDate}
              onChange={(e) => setAppointmentData({ ...appointmentData, appointmentDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
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
                value={appointmentData.startTime}
                onChange={(e) => {
                  const endTime = calculateEndTime(e.target.value)
                  setAppointmentData({ 
                    ...appointmentData, 
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
                value={appointmentData.endTime}
                onChange={(e) => setAppointmentData({ ...appointmentData, endTime: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
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
                value={appointmentData.type}
                onChange={(e) => setAppointmentData({ ...appointmentData, type: e.target.value })}
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
                value={appointmentData.priority}
                onChange={(e) => setAppointmentData({ ...appointmentData, priority: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Reason / Symptoms
            </label>
            <textarea
              value={appointmentData.reason}
              onChange={(e) => setAppointmentData({ ...appointmentData, reason: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              rows="3"
              placeholder="Enter reason for appointment or symptoms..."
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowAppointmentModal(false)}
              className={`px-6 py-2 rounded-lg border ${
                darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
              } transition`}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAppointment}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
            >
              Schedule Appointment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Patients