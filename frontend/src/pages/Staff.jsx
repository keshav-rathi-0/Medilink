import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Users, Briefcase, Filter, Download, Star, TrendingUp, Award } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import TableComponent from '../components/common/TableComponent'
import Modal from '../components/common/Modal'
import api from '../services/api'
import { toast } from 'react-toastify'

const Staff = () => {
  const { darkMode } = useTheme()
  const [staff, setStaff] = useState([])
  const [availableUsers, setAvailableUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPerformanceModal, setShowPerformanceModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [formData, setFormData] = useState({
    userId: '',
    designation: '',
    department: '',
    qualification: '',
    joiningDate: '',
    employmentType: 'Full-Time',
    shift: 'Morning',
    salary: {
      basic: '',
      allowances: ''
    },
    skills: [],
    supervisor: ''
  })
  const [performanceData, setPerformanceData] = useState({
    rating: 0,
    notes: ''
  })
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    fetchStaff()
    fetchAvailableUsers()
    fetchStats()
  }, [])

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const response = await api.get('/staff')
      setStaff(response.data.data || [])
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to fetch staff members')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableUsers = async () => {
    try {
      const response = await api.get('/staff/available-users')
      setAvailableUsers(response.data.data || [])
    } catch (error) {
      console.error('Fetch users error:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/staff/stats')
      setStats(response.data.data || null)
    } catch (error) {
      console.error('Fetch stats error:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.userId || !formData.designation || !formData.department || !formData.joiningDate) {
        toast.error('Please fill in all required fields')
        return
      }

      const payload = {
        ...formData,
        salary: {
          basic: parseFloat(formData.salary.basic) || 0,
          allowances: parseFloat(formData.salary.allowances) || 0
        }
      }

      if (selectedStaff) {
        await api.put(`/staff/${selectedStaff._id}`, payload)
        toast.success('Staff member updated successfully')
      } else {
        await api.post('/staff', payload)
        toast.success('Staff member added successfully')
        fetchAvailableUsers()
      }
      
      setShowAddModal(false)
      setFormData({
        userId: '',
        designation: '',
        department: '',
        qualification: '',
        joiningDate: '',
        employmentType: 'Full-Time',
        shift: 'Morning',
        salary: {
          basic: '',
          allowances: ''
        },
        skills: [],
        supervisor: ''
      })
      setSelectedStaff(null)
      fetchStaff()
      fetchStats()
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this staff member?')) {
      try {
        await api.delete(`/staff/${id}`)
        toast.success('Staff member deactivated successfully')
        fetchStaff()
        fetchAvailableUsers()
        fetchStats()
      } catch (error) {
        console.error('Delete error:', error)
        toast.error('Failed to deactivate staff member')
      }
    }
  }

  const handlePerformanceUpdate = async () => {
    try {
      if (performanceData.rating < 0 || performanceData.rating > 5) {
        toast.error('Rating must be between 0 and 5')
        return
      }

      await api.put(`/staff/${selectedStaff._id}/performance`, performanceData)
      toast.success('Performance updated successfully')
      setShowPerformanceModal(false)
      setPerformanceData({ rating: 0, notes: '' })
      setSelectedStaff(null)
      fetchStaff()
    } catch (error) {
      console.error('Performance update error:', error)
      toast.error('Failed to update performance')
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      })
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    })
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A'
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
    return age
  }

  const columns = [
    { 
      header: 'Employee ID', 
      accessor: 'employeeId',
      render: (row) => row.employeeId || 'N/A'
    },
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
            {row.userId?.name ? row.userId.name.split(' ').map(n => n[0]).join('') : '?'}
          </div>
          <div>
            <p className="font-semibold">{row.userId?.name || 'N/A'}</p>
            <p className="text-xs text-gray-500">{row.userId?.email || 'N/A'}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Designation', 
      accessor: 'designation'
    },
    { 
      header: 'Department', 
      accessor: 'department'
    },
    { 
      header: 'Phone', 
      accessor: 'phone',
      render: (row) => row.userId?.phone || 'N/A'
    },
    {
      header: 'Shift',
      accessor: 'shift',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.shift === 'Morning'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            : row.shift === 'Evening'
            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            : row.shift === 'Night'
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
        }`}>
          {row.shift}
        </span>
      )
    },
    {
      header: 'Employment',
      accessor: 'employmentType',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.employmentType === 'Full-Time'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : row.employmentType === 'Part-Time'
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
        }`}>
          {row.employmentType}
        </span>
      )
    },
    {
      header: 'Salary',
      accessor: 'salary',
      render: (row) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          ₹{row.salary?.total?.toLocaleString() || '0'}
        </span>
      )
    },
    {
      header: 'Performance',
      accessor: 'performance',
      render: (row) => (
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="font-medium">{row.performance?.rating || 'N/A'}</span>
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
              setSelectedStaff(row)
              setPerformanceData({
                rating: row.performance?.rating || 0,
                notes: row.performance?.notes || ''
              })
              setShowPerformanceModal(true)
            }}
            className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition"
            title="Update Performance"
          >
            <Award className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedStaff(row)
              setFormData({
                userId: row.userId?._id || '',
                designation: row.designation || '',
                department: row.department || '',
                qualification: row.qualification || '',
                joiningDate: row.joiningDate ? new Date(row.joiningDate).toISOString().split('T')[0] : '',
                employmentType: row.employmentType || 'Full-Time',
                shift: row.shift || 'Morning',
                salary: {
                  basic: row.salary?.basic || '',
                  allowances: row.salary?.allowances || ''
                },
                skills: row.skills || [],
                supervisor: row.supervisor?._id || ''
              })
              setShowAddModal(true)
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
            title="Deactivate"
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
            Staff Management
          </h1>
          <p className="text-gray-500 mt-1">Manage hospital staff and employees</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setSelectedStaff(null)
              setFormData({
                userId: '',
                designation: '',
                department: '',
                qualification: '',
                joiningDate: '',
                employmentType: 'Full-Time',
                shift: 'Morning',
                salary: {
                  basic: '',
                  allowances: ''
                },
                skills: [],
                supervisor: ''
              })
              setShowAddModal(true)
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Staff</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {stats?.totalStaff || staff.length}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Nurses</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {staff.filter(s => s.designation === 'Nurse').length}
              </h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Support Staff</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {staff.filter(s => s.designation !== 'Nurse').length}
              </h3>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">On Duty Today</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {staff.filter(s => s.isActive).length}
              </h3>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <TableComponent
        columns={columns}
        data={staff}
        searchPlaceholder="Search staff by name, ID, or designation..."
      />

      {/* Add/Edit Staff Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
        size="xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!selectedStaff && (
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Select User *
              </label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
                required
              >
                <option value="">Select a user...</option>
                {availableUsers.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.role} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Designation *
            </label>
            <select
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              required
            >
              <option value="">Select Designation</option>
              <option value="Nurse">Nurse</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Lab Technician">Lab Technician</option>
              <option value="Radiologist">Radiologist</option>
              <option value="Accountant">Accountant</option>
              <option value="Administrator">Administrator</option>
              <option value="Security">Security</option>
              <option value="Housekeeping">Housekeeping</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Department *
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              required
            >
              <option value="">Select Department</option>
              <option value="General Ward">General Ward</option>
              <option value="ICU">ICU</option>
              <option value="Emergency">Emergency</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Radiology">Radiology</option>
              <option value="Administration">Administration</option>
              <option value="Finance">Finance</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Employment Type
            </label>
            <select
              value={formData.employmentType}
              onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Intern">Intern</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Shift
            </label>
            <select
              value={formData.shift}
              onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="Morning">Morning (6 AM - 2 PM)</option>
              <option value="Evening">Evening (2 PM - 10 PM)</option>
              <option value="Night">Night (10 PM - 6 AM)</option>
              <option value="Rotational">Rotational</option>
            </select>
            </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Joining Date *
            </label>
            <input
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              required
            />
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
              placeholder="e.g., B.Sc Nursing, MBBS"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Basic Salary (₹)
            </label>
            <input
              type="number"
              value={formData.salary.basic}
              onChange={(e) => setFormData({ 
                ...formData, 
                salary: { ...formData.salary, basic: e.target.value }
              })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="30000"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Allowances (₹)
            </label>
            <input
              type="number"
              value={formData.salary.allowances}
              onChange={(e) => setFormData({ 
                ...formData, 
                salary: { ...formData.salary, allowances: e.target.value }
              })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="5000"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Total Salary (₹)
            </label>
            <input
              type="text"
              value={`₹${((parseFloat(formData.salary.basic) || 0) + (parseFloat(formData.salary.allowances) || 0)).toLocaleString()}`}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } bg-gray-100 dark:bg-gray-800`}
              disabled
            />
          </div>

          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Skills
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
                placeholder="Add a skill and press Enter"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-full text-sm flex items-center space-x-2 ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
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
            {selectedStaff ? 'Update' : 'Add'} Staff
          </button>
        </div>
      </Modal>

      {/* Performance Update Modal */}
      <Modal
        isOpen={showPerformanceModal}
        onClose={() => setShowPerformanceModal(false)}
        title={`Update Performance - ${selectedStaff?.userId?.name || ''}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Performance Rating (0-5)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={performanceData.rating}
                onChange={(e) => setPerformanceData({ ...performanceData, rating: parseFloat(e.target.value) })}
                className={`w-32 px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
              />
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 cursor-pointer ${
                      star <= Math.round(performanceData.rating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                    onClick={() => setPerformanceData({ ...performanceData, rating: star })}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Review Notes
            </label>
            <textarea
              value={performanceData.notes}
              onChange={(e) => setPerformanceData({ ...performanceData, notes: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              rows="4"
              placeholder="Enter performance review notes..."
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowPerformanceModal(false)}
              className={`px-6 py-2 rounded-lg border ${
                darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
              } transition`}
            >
              Cancel
            </button>
            <button
              onClick={handlePerformanceUpdate}
              className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition"
            >
              Update Performance
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Staff