import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, AlertTriangle, Package, TrendingDown, Filter, Download, PackagePlus, PackageMinus } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import TableComponent from '../components/common/TableComponent'
import Modal from '../components/common/Modal'
import api from '../services/api'
import { toast } from 'react-toastify'

const Pharmacy = () => {
  const { darkMode } = useTheme()
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    expiringSoon: 0,
    outOfStock: 0
  })
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    manufacturer: '',
    category: '',
    dosageForm: 'Tablet',
    strength: '',
    unitPrice: '',
    stockQuantity: '',
    reorderLevel: '',
    expiryDate: '',
    batchNumber: '',
    prescriptionRequired: true,
    storageConditions: '',
    supplier: {
      name: '',
      contact: '',
      email: ''
    }
  })
  const [stockData, setStockData] = useState({
    quantity: '',
    operation: 'add',
    batchNumber: '',
    expiryDate: ''
  })

  useEffect(() => {
    fetchMedicines()
    fetchStats()
  }, [])

  const fetchMedicines = async () => {
    setLoading(true)
    try {
      const response = await api.get('/medicines')
      setMedicines(response.data.data || [])
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to fetch medicines')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/medicines/stats')
      setStats(response.data.data || {})
    } catch (error) {
      console.error('Stats error:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.genericName || !formData.manufacturer || 
          !formData.category || !formData.unitPrice || !formData.expiryDate) {
        toast.error('Please fill in all required fields')
        return
      }

      // Prepare payload
      const payload = {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        reorderLevel: parseInt(formData.reorderLevel) || 50
      }

      if (selectedMedicine) {
        await api.put(`/medicines/${selectedMedicine._id}`, payload)
        toast.success('Medicine updated successfully')
      } else {
        await api.post('/medicines', payload)
        toast.success('Medicine added successfully')
      }
      
      setShowAddModal(false)
      resetForm()
      fetchMedicines()
      fetchStats()
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleStockUpdate = async () => {
    try {
      if (!stockData.quantity || stockData.quantity <= 0) {
        toast.error('Please enter a valid quantity')
        return
      }

      const payload = {
        quantity: parseInt(stockData.quantity),
        operation: stockData.operation
      }

      if (stockData.operation === 'add') {
        if (stockData.batchNumber) payload.batchNumber = stockData.batchNumber
        if (stockData.expiryDate) payload.expiryDate = stockData.expiryDate
      }

      await api.put(`/medicines/${selectedMedicine._id}/stock`, payload)
      toast.success('Stock updated successfully')
      setShowStockModal(false)
      setStockData({
        quantity: '',
        operation: 'add',
        batchNumber: '',
        expiryDate: ''
      })
      fetchMedicines()
      fetchStats()
    } catch (error) {
      console.error('Stock update error:', error)
      toast.error(error.response?.data?.message || 'Failed to update stock')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await api.delete(`/medicines/${id}`)
        toast.success('Medicine deleted successfully')
        fetchMedicines()
        fetchStats()
      } catch (error) {
        console.error('Delete error:', error)
        toast.error('Failed to delete medicine')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      genericName: '',
      manufacturer: '',
      category: '',
      dosageForm: 'Tablet',
      strength: '',
      unitPrice: '',
      stockQuantity: '',
      reorderLevel: '',
      expiryDate: '',
      batchNumber: '',
      prescriptionRequired: true,
      storageConditions: '',
      supplier: {
        name: '',
        contact: '',
        email: ''
      }
    })
    setSelectedMedicine(null)
  }

  const getStatusColor = (medicine) => {
    const stockStatus = getStockStatus(medicine)
    switch (stockStatus) {
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

  const getStockStatus = (medicine) => {
    if (medicine.stockQuantity === 0) return 'Out of Stock'
    if (medicine.stockQuantity <= medicine.reorderLevel * 0.3) return 'Critical'
    if (medicine.stockQuantity <= medicine.reorderLevel) return 'Low Stock'
    return 'In Stock'
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
      accessor: 'stockQuantity',
      render: (row) => (
        <span className={`font-semibold ${
          row.stockQuantity <= row.reorderLevel ? 'text-red-600' : 'text-green-600'
        }`}>
          {row.stockQuantity}
        </span>
      )
    },
    {
      header: 'Price',
      accessor: 'unitPrice',
      render: (row) => <span className="font-semibold">₹{row.unitPrice?.toFixed(2)}</span>
    },
    { 
      header: 'Expiry Date', 
      accessor: 'expiryDate',
      render: (row) => new Date(row.expiryDate).toLocaleDateString()
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => {
        const status = getStockStatus(row)
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(row)}`}>
            {status}
          </span>
        )
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedMedicine(row)
              setStockData({
                quantity: '',
                operation: 'add',
                batchNumber: row.batchNumber || '',
                expiryDate: row.expiryDate ? new Date(row.expiryDate).toISOString().split('T')[0] : ''
              })
              setShowStockModal(true)
            }}
            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
            title="Update Stock"
          >
            <PackagePlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedMedicine(row)
              setFormData({
                name: row.name,
                genericName: row.genericName,
                manufacturer: row.manufacturer,
                category: row.category,
                dosageForm: row.dosageForm || 'Tablet',
                strength: row.strength || '',
                unitPrice: row.unitPrice,
                stockQuantity: row.stockQuantity,
                reorderLevel: row.reorderLevel,
                expiryDate: row.expiryDate ? new Date(row.expiryDate).toISOString().split('T')[0] : '',
                batchNumber: row.batchNumber || '',
                prescriptionRequired: row.prescriptionRequired !== undefined ? row.prescriptionRequired : true,
                storageConditions: row.storageConditions || '',
                supplier: row.supplier || { name: '', contact: '', email: '' }
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
            Pharmacy Management
          </h1>
          <p className="text-gray-500 mt-1">Manage medicines and inventory</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              resetForm()
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
                {stats.totalMedicines || 0}
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
                {stats.lowStock || 0}
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
              <p className="text-sm text-gray-500 font-medium">Expiring Soon</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {stats.expiringSoon || 0}
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
              <p className="text-sm text-gray-500 font-medium">Out of Stock</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {stats.outOfStock || 0}
              </h3>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-900/30 rounded-lg">
              <PackageMinus className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
        <TableComponent
          columns={columns}
          data={medicines}
          searchPlaceholder="Search medicines by name, ID, or category..."
        />
      </div>

      {/* Add/Edit Medicine Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={selectedMedicine ? 'Edit Medicine' : 'Add New Medicine'}
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Medicine Name *
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
                Generic Name *
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
                Manufacturer *
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
                Category *
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
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Gastrointestinal">Gastrointestinal</option>
                <option value="Respiratory">Respiratory</option>
                <option value="Neurological">Neurological</option>
                <option value="Dermatological">Dermatological</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Dosage Form
              </label>
              <select
                value={formData.dosageForm}
                onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Cream">Cream</option>
                <option value="Ointment">Ointment</option>
                <option value="Drops">Drops</option>
                <option value="Inhaler">Inhaler</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Strength
              </label>
              <input
                type="text"
                value={formData.strength}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
                placeholder="500mg"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Unit Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
                placeholder="5.50"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Stock Quantity
              </label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
                placeholder="500"
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

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Expiry Date *
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
                Batch Number
              </label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
                placeholder="BATCH001"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Storage Conditions
              </label>
              <input
                type="text"
                value={formData.storageConditions}
                onChange={(e) => setFormData({ ...formData, storageConditions: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
                placeholder="Store in cool, dry place"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="prescriptionRequired"
              checked={formData.prescriptionRequired}
              onChange={(e) => setFormData({ ...formData, prescriptionRequired: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="prescriptionRequired" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Prescription Required
            </label>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Supplier Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Supplier Name
                </label>
                <input
                  type="text"
                  value={formData.supplier.name}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    supplier: { ...formData.supplier, name: e.target.value }
                  })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
                  placeholder="Supplier Name"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={formData.supplier.contact}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    supplier: { ...formData.supplier, contact: e.target.value }
                  })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
                  placeholder="Contact Number"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.supplier.email}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    supplier: { ...formData.supplier, email: e.target.value }
                  })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
                  placeholder="supplier@example.com"
                />
              </div>
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
            {selectedMedicine ? 'Update' : 'Add'} Medicine
          </button>
        </div>
      </Modal>

      {/* Stock Update Modal */}
      <Modal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        title={`Update Stock - ${selectedMedicine?.name || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Current Stock</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {selectedMedicine?.stockQuantity || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Reorder Level</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {selectedMedicine?.reorderLevel || 0}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Operation *
            </label>
            <select
              value={stockData.operation}
              onChange={(e) => setStockData({ ...stockData, operation: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="add">Add Stock</option>
              <option value="reduce">Reduce Stock</option>
              <option value="set">Set Stock</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              value={stockData.quantity}
              onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter quantity"
            />
          </div>

          {stockData.operation === 'add' && (
            <>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Batch Number
                </label>
                <input
                  type="text"
                  value={stockData.batchNumber}
                  onChange={(e) => setStockData({ ...stockData, batchNumber: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
                  placeholder="BATCH001"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={stockData.expiryDate}
                  onChange={(e) => setStockData({ ...stockData, expiryDate: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </>
          )}

          {stockData.quantity && (
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
              <p className="text-sm font-medium mb-1">New Stock Level:</p>
              <p className={`text-xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {stockData.operation === 'add' 
                  ? (selectedMedicine?.stockQuantity || 0) + parseInt(stockData.quantity || 0)
                  : stockData.operation === 'reduce'
                  ? Math.max(0, (selectedMedicine?.stockQuantity || 0) - parseInt(stockData.quantity || 0))
                  : parseInt(stockData.quantity || 0)
                }
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowStockModal(false)}
            className={`px-6 py-2 rounded-lg border ${
              darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
            } transition`}
          >
            Cancel
          </button>
          <button
            onClick={handleStockUpdate}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
          >
            Update Stock
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Pharmacy