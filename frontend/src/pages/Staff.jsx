import React, { useState } from 'react'
import { Plus, Edit, Trash2, Users, Briefcase, Filter, Download } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import TableComponent from '../components/common/TableComponent'
import Modal from '../components/common/Modal'
import { toast } from 'react-toastify'

const Staff = () => {
  const { darkMode } = useTheme()
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    joiningDate: '',
    salary: '',
    shift: '',
    address: ''
  })

  const staff = [
    {
      _id: '1',
      staffId: 'STF001',
      name: 'Alice Cooper',
      role: 'Nurse',
      department: 'General Ward',
      phone: '+1234567890',
      email: 'alice.cooper@hospital.com',
      shift: 'Morning',
      joiningDate: '2020-01-15',
      salary: 45000,
      status: 'Active'
    },
    {
      _id: '2',
      staffId: 'STF002',
      name: 'Bob Williams',
      role: 'Receptionist',
      department: 'Front Desk',
      phone: '+1234567891',
      email: 'bob.williams@hospital.com',
      shift: 'Evening',
      joiningDate: '2021-03-20',
      salary: 35000,
      status: 'Active'
    },
    {
      _id: '3',
      staffId: 'STF003',
      name: 'Carol Martinez',
      role: 'Pharmacist',
      department: 'Pharmacy',
      phone: '+1234567892',
      email: 'carol.martinez@hospital.com',
      shift: 'Morning',
      joiningDate: '2019-07-10',
      salary: 50000,
      status: 'Active'
    },
    {
      _id: '4',
      staffId: 'STF004',
      name: 'David Lee',
      role: 'Lab Technician',
      department: 'Laboratory',
      phone: '+1234567893',
      email: 'david.lee@hospital.com',
      shift: 'Night',
      joiningDate: '2022-02-01',
      salary: 42000,
      status: 'Active'
    }
  ]

  const handleSubmit = () => {
    toast.success(selectedStaff ? 'Staff updated successfully' : 'Staff added successfully')
    setShowAddModal(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      joiningDate: '',
      salary: '',
      shift: '',
      address: ''
    })
    setSelectedStaff(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      toast.success('Staff deleted successfully')
    }
  }

  const columns = [
    { header: 'Staff ID', accessor: 'staffId' },
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
            {row.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-semibold">{row.name}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    { header: 'Role', accessor: 'role' },
    { header: 'Department', accessor: 'department' },
    { header: 'Phone', accessor: 'phone' },
    {
      header: 'Shift',
      accessor: 'shift',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.shift === 'Morning'
            ? 'bg-blue-100 text-blue-700'
            : row.shift === 'Evening'
            ? 'bg-orange-100 text-orange-700'
            : 'bg-purple-100 text-purple-700'
        }`}>
          {row.shift}
        </span>
      )
    },
    {
      header: 'Salary',
      accessor: 'salary',
      render: (row) => <span className="font-semibold text-green-600">${row.salary.toLocaleString()}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          {row.status}
        </span>
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
              setFormData(row)
              setShowAddModal(true)
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
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
              setSelectedStaff(null)
              setFormData({
                name: '',
                email: '',
                phone: '',
                role: '',
                department: '',
                joiningDate: '',
                salary: '',
                shift: '',
                address: ''
              })
              setShowAddModal(true)
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Staff</span>
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
                {staff.length}
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
                {staff.filter(s => s.role === 'Nurse').length}
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
                {staff.filter(s => s.role !== 'Nurse').length}
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
                {staff.filter(s => s.status === 'Active').length}
              </h3>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Briefcase className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <TableComponent
        columns={columns}
        data={staff}
        searchPlaceholder="Search staff by name, ID, or role..."
      />

      {/* Add/Edit Staff Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
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
              placeholder="John Doe"
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
              placeholder="john.doe@hospital.com"
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
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Role</option>
              <option value="Nurse">Nurse</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Lab Technician">Lab Technician</option>
              <option value="Radiologist">Radiologist</option>
              <option value="Accountant">Accountant</option>
              <option value="Administrator">Administrator</option>
            </select>
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
              <option value="General Ward">General Ward</option>
              <option value="ICU">ICU</option>
              <option value="Emergency">Emergency</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Radiology">Radiology</option>
              <option value="Administration">Administration</option>
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
              <option value="">Select Shift</option>
              <option value="Morning">Morning (6 AM - 2 PM)</option>
              <option value="Evening">Evening (2 PM - 10 PM)</option>
              <option value="Night">Night (10 PM - 6 AM)</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Joining Date
            </label>
            <input
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Salary (Annual)
            </label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="45000"
            />
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
    </div>
  )
}

export default Staff