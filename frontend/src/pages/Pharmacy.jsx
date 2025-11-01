import React, { useState } from 'react'
import { Plus, Edit, Trash2, AlertTriangle, Package, TrendingDown, Filter, Download } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import TableComponent from '../components/common/TableComponent'
import Modal from '../components/common/Modal'
import { toast } from 'react-toastify'

const Pharmacy = () => {
  const { darkMode } = useTheme()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [activeTab, setActiveTab] = useState('inventory')
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    manufacturer: '',
    category: '',
    quantity: '',
    price: '',
    expiryDate: '',
    reorderLevel: ''
  })

  const medicines = [
    {
      _id: '1',
      medicineId: 'MED001',
      name: 'Paracetamol 500mg',
      genericName: 'Acetaminophen',
      manufacturer: 'PharmaCorp',
      category: 'Analgesic',
      quantity: 500,
      price: 5.50,
      expiryDate: '2025-12-31',
      reorderLevel: 100,
      status: 'In Stock'
    },
    {
      _id: '2',
      medicineId: 'MED002',
      name: 'Amoxicillin 250mg',
      genericName: 'Amoxicillin',
      manufacturer: 'MediLabs',
      category: 'Antibiotic',
      quantity: 45,
      price: 12.00,
      expiryDate: '2025-06-30',
      reorderLevel: 50,
      status: 'Low Stock'
    },
    {
      _id: '3',
      medicineId: 'MED003',
      name: 'Ibuprofen 400mg',
      genericName: 'Ibuprofen',
      manufacturer: 'HealthPlus',
      category: 'Anti-inflammatory',
      quantity: 10,
      price: 8.00,
      expiryDate: '2024-11-15',
      reorderLevel: 80,
      status: 'Critical'
    },
    {
      _id: '4',
      medicineId: 'MED004',
      name: 'Metformin 500mg',
      genericName: 'Metformin HCl',
      manufacturer: 'DiabCare',
      category: 'Antidiabetic',
      quantity: 300,
      price: 15.00,
      expiryDate: '2026-03-20',
      reorderLevel: 100,
      status: 'In Stock'
    }
  ]

  const prescriptions = [
    {
      id: 1,
      prescriptionId: 'PRE001',
      patient: 'John Smith',
      doctor: 'Dr. Sarah Wilson',
      date: '2024-10-30',
      medicines: ['Paracetamol 500mg', 'Amoxicillin 250mg'],
      status: 'Pending'
    },
    {
      id: 2,
      prescriptionId: 'PRE002',
      patient: 'Emma Johnson',
      doctor: 'Dr. Michael Brown',
      date: '2024-10-30',
      medicines: ['Ibuprofen 400mg'],
      status: 'Dispensed'
    },
    {
      id: 3,
      prescriptionId: 'PRE003',
      patient: 'Robert Davis',
      doctor: 'Dr. Emily Chen',
      date: '2024-10-31',
      medicines: ['Metformin 500mg'],
      status: 'Pending'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'Critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'Out of Stock':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const handleSubmit = () => {
    toast.success(selectedMedicine ? 'Medicine updated successfully' : 'Medicine added successfully')
    setShowAddModal(false)
    setFormData({
      name: '',
      genericName: '',
      manufacturer: '',
      category: '',
      quantity: '',
      price: '',
      expiryDate: '',
      reorderLevel: ''
    })
    setSelectedMedicine(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      toast.success('Medicine deleted successfully')
    }
  }

  const columns = [
    { header: 'Medicine ID', accessor: 'medicineId' },
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <p className="font-semibold">{row.name}</p>
          <p className="text-xs text-gray-500">{row.genericName}</p>
        </div>
      )
    },
    { header: 'Manufacturer', accessor: 'manufacturer' },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Quantity',
      accessor: 'quantity',
      render: (row) => (
        <span className={`font-semibold ${
          row.quantity <= row.reorderLevel ? 'text-red-600' : 'text-green-600'
        }`}>
          {row.quantity}
        </span>
      )
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (row) => <span className="font-semibold">${row.price}</span>
    },
    { header: 'Expiry Date', accessor: 'expiryDate' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
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
              setSelectedMedicine(row)
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

  const prescriptionColumns = [
    { header: 'Prescription ID', accessor: 'prescriptionId' },
    { header: 'Patient', accessor: 'patient' },
    { header: 'Doctor', accessor: 'doctor' },
    { header: 'Date', accessor: 'date' },
    {
      header: 'Medicines',
      accessor: 'medicines',
      render: (row) => (
        <div className="text-sm">
          {row.medicines.map((med, index) => (
            <div key={index} className="text-gray-600 dark:text-gray-400">{med}</div>
          ))}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.status === 'Dispensed'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => {
            toast.success('Prescription dispensed successfully')
          }}
          disabled={row.status === 'Dispensed'}
          className={`px-3 py-1 rounded-lg text-sm font-medium ${
            row.status === 'Dispensed'
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } transition`}
        >
          {row.status === 'Dispensed' ? 'Dispensed' : 'Dispense'}
        </button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Pharmacy Management
          </h1>
          <p className="text-gray-500 mt-1">Manage medicines, prescriptions, and inventory</p>
        </div>
        <div className="flex space-x-3">
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
              setSelectedMedicine(null)
              setFormData({
                name: '',
                genericName: '',
                manufacturer: '',
                category: '',
                quantity: '',
                price: '',
                expiryDate: '',
                reorderLevel: ''
              })
              setShowAddModal(true)
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Medicines</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {medicines.length}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Low Stock</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {medicines.filter(m => m.status === 'Low Stock' || m.status === 'Critical').length}
              </h3>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <TrendingDown className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Expired Soon</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                1
              </h3>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Prescriptions</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {prescriptions.filter(p => p.status === 'Pending').length}
              </h3>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl`}>
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-4 font-medium transition ${
              activeTab === 'inventory'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Medicine Inventory
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-6 py-4 font-medium transition ${
              activeTab === 'prescriptions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Prescriptions
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'inventory' ? (
            <TableComponent
              columns={columns}
              data={medicines}
              searchPlaceholder="Search medicines by name, ID, or category..."
            />
          ) : (
            <TableComponent
              columns={prescriptionColumns}
              data={prescriptions}
              searchPlaceholder="Search prescriptions by ID or patient name..."
            />
          )}
        </div>
      </div>

      {/* Add/Edit Medicine Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={selectedMedicine ? 'Edit Medicine' : 'Add New Medicine'}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Medicine Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="Paracetamol 500mg"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Generic Name
            </label>
            <input
              type="text"
              value={formData.genericName}
              onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="Acetaminophen"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Manufacturer
            </label>
            <input
              type="text"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="PharmaCorp"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Category</option>
              <option value="Analgesic">Analgesic</option>
              <option value="Antibiotic">Antibiotic</option>
              <option value="Anti-inflammatory">Anti-inflammatory</option>
              <option value="Antidiabetic">Antidiabetic</option>
              <option value="Antihypertensive">Antihypertensive</option>
              <option value="Antihistamine">Antihistamine</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Quantity
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="500"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="5.50"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Expiry Date
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Reorder Level
            </label>
            <input
              type="number"
              value={formData.reorderLevel}
              onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
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
            {selectedMedicine ? 'Update' : 'Add'} Medicine
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Pharmacy