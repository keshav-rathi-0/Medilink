import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Calendar, Clock, Star, Filter, Search } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import TableComponent from '../components/common/TableComponent'
import Modal from '../components/common/Modal'
import * as doctorService from '../services/doctorService'
import { toast } from 'react-toastify'

const Doctors = () => {
  const { darkMode } = useTheme()
  const [doctors, setDoctors] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
    experience: '',
    department: '',
    consultationFee: '',
    availability: []
  })

  const [scheduleData, setScheduleData] = useState({
    monday: { available: false, startTime: '09:00', endTime: '17:00' },
    tuesday: { available: false, startTime: '09:00', endTime: '17:00' },
    wednesday: { available: false, startTime: '09:00', endTime: '17:00' },
    thursday: { available: false, startTime: '09:00', endTime: '17:00' },
    friday: { available: false, startTime: '09:00', endTime: '17:00' },
    saturday: { available: false, startTime: '09:00', endTime: '14:00' },
    sunday: { available: false, startTime: '09:00', endTime: '14:00' }
  })

  const mockDoctors = [
    {
      _id: '1',
      doctorId: 'DOC001',
      name: 'Dr. Sarah Wilson',
      specialization: 'Cardiology',
      qualification: 'MD, DM Cardiology',
      experience: '15 years',
      phone: '+1234567890',
      email: 'sarah.wilson@hospital.com',
      consultationFee: 150,
      rating: 4.8,
      patientsServed: 1250
    },
    {
      _id: '2',
      doctorId: 'DOC002',
      name: 'Dr. Michael Brown',
      specialization: 'Neurology',
      qualification: 'MD, DM Neurology',
      experience: '12 years',
      phone: '+1234567891',
      email: 'michael.brown@hospital.com',
      consultationFee: 180,
      rating: 4.9,
      patientsServed: 980
    },
    {
      _id: '3',
      doctorId: 'DOC003',
      name: 'Dr. Emily Chen',
      specialization: 'Orthopedics',
      qualification: 'MS Orthopedics',
      experience: '10 years',
      phone: '+1234567892',
      email: 'emily.chen@hospital.com',
      consultationFee: 120,
      rating: 4.7,
      patientsServed: 850
    },
    {
      _id: '4',
      doctorId: 'DOC004',
      name: 'Dr. James Taylor',
      specialization: 'Pediatrics',
      qualification: 'MD Pediatrics',
      experience: '8 years',
      phone: '+1234567893',
      email: 'james.taylor@hospital.com',
      consultationFee: 100,
      rating: 4.6,
      patientsServed: 1500
    }
  ]

  const handleSubmit = () => {
    toast.success(selectedDoctor ? 'Doctor updated successfully' : 'Doctor added successfully')
    setShowAddModal(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      qualification: '',
      experience: '',
      department: '',
      consultationFee: '',
      availability: []
    })
    setSelectedDoctor(null)
  }

  const handleScheduleUpdate = () => {
    toast.success('Schedule updated successfully')
    setShowScheduleModal(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      toast.success('Doctor deleted successfully')
    }
  }

  const columns = [
    { 
      header: 'Doctor ID', 
      accessor: 'doctorId',
      render: (row) => (
        <span className="font-mono text-sm">{row.doctorId}</span>
      )
    },
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-semibold">
            {row.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-semibold">{row.name}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    { header: 'Specialization', accessor: 'specialization' },
    { header: 'Qualification', accessor: 'qualification' },
    { 
      header: 'Experience', 
      accessor: 'experience',
      render: (row) => (
        <span className="text-sm">{row.experience}</span>
      )
    },
    {
      header: 'Fee',
      accessor: 'consultationFee',
      render: (row) => (
        <span className="font-semibold text-green-600">${row.consultationFee}</span>
      )
    },
    {
      header: 'Rating',
      accessor: 'rating',
      render: (row) => (
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold">{row.rating}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedDoctor(row)
              setShowScheduleModal(true)
            }}
            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
            title="Manage Schedule"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedDoctor(row)
              setFormData(row)
              setShowAddModal(true)
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
            title="Edit Doctor"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
            title="Delete Doctor"
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
            Doctor Management
          </h1>
          <p className="text-gray-500 mt-1">Manage doctor profiles and schedules</p>
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
            onClick={() => {
              setSelectedDoctor(null)
              setFormData({
                name: '',
                email: '',
                phone: '',
                specialization: '',
                qualification: '',
                experience: '',
                department: '',
                consultationFee: '',
                availability: []
              })
              setShowAddModal(true)
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Doctors</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {mockDoctors.length}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">On Duty Today</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                18
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
              <p className="text-sm text-gray-500 font-medium">Specializations</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                12
              </h3>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Avg Rating</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                4.7
              </h3>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <TableComponent
        columns={columns}
        data={mockDoctors}
        searchPlaceholder="Search doctors by name, ID, or specialization..."
      />

      {/* Add/Edit Doctor Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={selectedDoctor ? 'Edit Doctor' : 'Add New Doctor'}
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
              placeholder="Dr. John Doe"
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
              placeholder="doctor@hospital.com"
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
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Specialization
            </label>
            <select
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Specialization</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Gynecology">Gynecology</option>
              <option value="ENT">ENT</option>
              <option value="General Surgery">General Surgery</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Qualification
            </label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="MD, DM"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Experience (Years)
            </label>
            <input
              type="number"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="10"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Department
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Department</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Consultation Fee ($)
            </label>
            <input
              type="number"
              value={formData.consultationFee}
              onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="100"
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
            {selectedDoctor ? 'Update' : 'Add'} Doctor
          </button>
        </div>
      </Modal>

      {/* Schedule Management Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title={`Manage Schedule - ${selectedDoctor?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          {Object.keys(scheduleData).map((day) => (
            <div
              key={day}
              className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={scheduleData[day].available}
                    onChange={(e) =>
                      setScheduleData({
                        ...scheduleData,
                        [day]: { ...scheduleData[day], available: e.target.checked }
                      })
                    }
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label className={`text-sm font-semibold capitalize ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {day}
                  </label>
                </div>
              </div>
              {scheduleData[day].available && (
                <div className="grid grid-cols-2 gap-3 ml-8">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={scheduleData[day].startTime}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          [day]: { ...scheduleData[day], startTime: e.target.value }
                        })
                      }
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Time</label>
                    <input
                      type="time"
                      value={scheduleData[day].endTime}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          [day]: { ...scheduleData[day], endTime: e.target.value }
                        })
                      }
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowScheduleModal(false)}
            className={`px-6 py-2 rounded-lg border ${
              darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
            } transition`}
          >
            Cancel
          </button>
          <button
            onClick={handleScheduleUpdate}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
          >
            Update Schedule
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Doctors