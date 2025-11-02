import React, { useState, useEffect } from 'react'
import { Plus, Edit, Eye, Trash2, Download, Filter, FileText, Calendar, Activity } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import TableComponent from '../components/common/TableComponent'
import Modal from '../components/common/Modal'
import * as patientService from '../services/patientService'
import { toast } from 'react-toastify'

const Patients = () => {
  const { darkMode } = useTheme()
  const [patients, setPatients] = useState([])
  const [availableUsers, setAvailableUsers] = useState([])
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
    appointmentTime: '',
    reason: '',
    type: 'Consultation'
  })

  useEffect(() => {
    fetchPatients()
    fetchAvailableUsers()
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
      const data = await patientService.getPatientAppointments(patient._id)
      setAppointments(data.data || [])
      setSelectedPatient(patient)
      setShowViewModal(true)
    } catch (error) {
      toast.error('Failed to fetch appointments')
    }
  }

  const handleCreateAppointment = async () => {
    try {
      const payload = {
        patient: selectedPatient._id,
        doctor: appointmentData.doctorId,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime,
        reason: appointmentData.reason,
        type: appointmentData.type,
        status: 'Scheduled'
      }
      
      await patientService.createAppointment(payload)
      toast.success('Appointment created successfully')
      setShowAppointmentModal(false)
      setAppointmentData({
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
        type: 'Consultation'
      })
    } catch (error) {
      toast.error('Failed to create appointment')
    }
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
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
            title="View Medical Records"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => viewAppointments(row)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
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
                appointmentTime: '',
                reason: '',
                type: 'Consultation'
              })
              setShowAppointmentModal(true)
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
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
            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
                    <p className="font-medium">Dr. {apt.doctor?.name}</p>
                    <p className="text-sm text-gray-500">{apt.doctor?.specialization}</p>
                    <p className="text-sm mt-2">
                      {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                    </p>
                    <p className="text-sm">Reason: {apt.reason}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    apt.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                    apt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
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
        title="Schedule Appointment"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Doctor ID
            </label>
            <input
              type="text"
              value={appointmentData.doctorId}
              onChange={(e) => setAppointmentData({ ...appointmentData, doctorId: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter doctor ID"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Appointment Date
            </label>
            <input
              type="date"
              value={appointmentData.appointmentDate}
              onChange={(e) => setAppointmentData({ ...appointmentData, appointmentDate: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Appointment Time
            </label>
            <input
              type="time"
              value={appointmentData.appointmentTime}
              onChange={(e) => setAppointmentData({ ...appointmentData, appointmentTime: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Type
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
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Reason
            </label>
            <textarea
              value={appointmentData.reason}
              onChange={(e) => setAppointmentData({ ...appointmentData, reason: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              rows="3"
              placeholder="Enter reason for appointment"
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