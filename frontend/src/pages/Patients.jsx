import React, { useState, useEffect } from 'react'
import { Plus, Edit, Eye, Trash2, Download, Filter } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import TableComponent from '../components/common/TableComponent'
import Modal from '../components/common/Modal'
import * as patientService from '../services/patientService'
import { toast } from 'react-toastify'

const Patients = () => {
  const { darkMode } = useTheme()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    address: '',
    emergencyContact: ''
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const data = await patientService.getAllPatients()
      setPatients(data.patients || [])
    } catch (error) {
      toast.error('Failed to fetch patients')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (selectedPatient) {
        await patientService.updatePatient(selectedPatient._id, formData)
        toast.success('Patient updated successfully')
      } else {
        await patientService.createPatient(formData)
        toast.success('Patient added successfully')
      }
      setShowAddModal(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        address: '',
        emergencyContact: ''
      })
      setSelectedPatient(null)
      fetchPatients()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientService.deletePatient(id)
        toast.success('Patient deleted successfully')
        fetchPatients()
      } catch (error) {
        toast.error('Failed to delete patient')
      }
    }
  }

  const columns = [
    { header: 'Patient ID', accessor: 'patientId' },
    { header: 'Name', accessor: 'name' },
    { header: 'Age', accessor: 'age' },
    { header: 'Gender', accessor: 'gender' },
    { header: 'Blood Group', accessor: 'bloodGroup' },
    { header: 'Phone', accessor: 'phone' },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedPatient(row)
              setFormData(row)
              setShowAddModal(true)
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  // Mock data for demonstration
  const mockPatients = [
    {
      _id: '1',
      patientId: 'P001',
      name: 'John Smith',
      age: 45,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+1234567890'
    },
    {
      _id: '2',
      patientId: 'P002',
      name: 'Emma Johnson',
      age: 32,
      gender: 'Female',
      bloodGroup: 'A+',
      phone: '+1234567891'
    },
    {
      _id: '3',
      patientId: 'P003',
      name: 'Michael Brown',
      age: 58,
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '+1234567892'
    }
  ]

  const displayPatients = patients.length > 0 ? patients : mockPatients

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
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
              darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
            } transition`}
          >
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
              darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
            } transition`}
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              setSelectedPatient(null)
              setFormData({
                name: '',
                email: '',
                phone: '',
                dateOfBirth: '',
                gender: '',
                bloodGroup: '',
                address: '',
                emergencyContact: ''
              })
              setShowAddModal(true)
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      <TableComponent
        columns={columns}
        data={displayPatients}
        searchPlaceholder="Search patients by name, ID, or phone..."
      />

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={selectedPatient ? 'Edit Patient' : 'Add New Patient'}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

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

          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              rows="3"
              placeholder="Enter address"
            />
          </div>

          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Emergency Contact
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
      </Modal>
    </div>
  )
}

export default Patients
