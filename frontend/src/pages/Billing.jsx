import React, { useState, useEffect } from 'react'
import { Plus, DollarSign, FileText, Download, Eye, CreditCard, CheckCircle, Clock, Trash2, User, Calendar } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import TableComponent from '../components/common/TableComponent'
import Modal from '../components/common/Modal'
import { toast } from 'react-toastify'
import * as billingService from '../services/billingService'

const Billing = () => {
  const { darkMode } = useTheme()
  const [bills, setBills] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showInsuranceModal, setShowInsuranceModal] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCollected: 0,
    totalPending: 0,
    totalBills: 0
  })
  
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: '',
    transactionId: '',
    notes: ''
  })

  const [insuranceData, setInsuranceData] = useState({
    claimNumber: '',
    provider: '',
    amountClaimed: ''
  })

  const [generateData, setGenerateData] = useState({
    patient: '',
    billDate: new Date().toISOString().split('T')[0],
    items: [],
    discount: 0,
    tax: 0,
    notes: ''
  })

  const [newItem, setNewItem] = useState({
    description: '',
    category: 'Consultation',
    quantity: 1,
    unitPrice: 0
  })

  const serviceTemplates = [
    { name: 'General Consultation', category: 'Consultation', price: 500 },
    { name: 'Specialist Consultation', category: 'Consultation', price: 1000 },
    { name: 'Complete Blood Count (CBC)', category: 'Lab Test', price: 300 },
    { name: 'Blood Sugar Test', category: 'Lab Test', price: 150 },
    { name: 'Lipid Profile', category: 'Lab Test', price: 800 },
    { name: 'X-Ray Chest', category: 'Imaging', price: 500 },
    { name: 'Ultrasound', category: 'Imaging', price: 1200 },
    { name: 'CT Scan', category: 'Imaging', price: 3500 },
    { name: 'MRI Scan', category: 'Imaging', price: 5000 },
    { name: 'ECG', category: 'Lab Test', price: 200 },
    { name: 'Room Charges (General Ward)', category: 'Room Charges', price: 1000 },
    { name: 'Room Charges (Private)', category: 'Room Charges', price: 2500 },
    { name: 'Room Charges (ICU)', category: 'Room Charges', price: 5000 },
    { name: 'Emergency Service', category: 'Emergency', price: 1500 },
    { name: 'Minor Surgery', category: 'Surgery', price: 15000 },
    { name: 'Major Surgery', category: 'Surgery', price: 50000 },
    { name: 'Medicines', category: 'Medicine', price: 0 }
  ]

  useEffect(() => {
    fetchBills()
    fetchPatients()
    fetchStats()
  }, [])

  const fetchBills = async () => {
    setLoading(true)
    try {
      const response = await billingService.getAllBills({ limit: 100 })
      console.log('✅ Bills Response:', response.bills);
      
      const billsData = response.bills || []
      setBills(billsData)
    } catch (error) {
      console.error('❌ Fetch bills error:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch bills')
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const response = await billingService.getAllPatients({ limit: 1000 })
      console.log('✅ Patients Response:', response.data)
      
      const patientsData = response.data || []
      console.log('✅ Total Patients:', patientsData.length)
      
      if (patientsData.length > 0) {
        console.log('✅ First Patient:', patientsData[0])
      }
      
      setPatients(patientsData)
    } catch (error) {
      console.error('❌ Fetch patients error:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch patients')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await billingService.getBillingStats()
      console.log('📊 Stats Response:', response)
      
      // Handle different response structures
      const statsData = response.data?.data || response.data || response
      
      console.log('📊 Processed Stats:', statsData)
      
      setStats({
        totalRevenue: statsData.totalRevenue || 0,
        totalCollected: statsData.totalCollected || 0,
        totalPending: statsData.totalPending || 0,
        totalBills: statsData.totalBills || 0
      })
    } catch (error) {
      console.error('❌ Stats error:', error)
      // Set default values on error
      setStats({
        totalRevenue: 0,
        totalCollected: 0,
        totalPending: 0,
        totalBills: 0
      })
    }
  }

  const addItem = () => {
    if (!newItem.description || newItem.unitPrice <= 0) {
      toast.error('Please enter valid item details')
      return
    }

    setGenerateData({
      ...generateData,
      items: [...generateData.items, { ...newItem }]
    })

    setNewItem({
      description: '',
      category: 'Consultation',
      quantity: 1,
      unitPrice: 0
    })
  }

  const removeItem = (index) => {
    setGenerateData({
      ...generateData,
      items: generateData.items.filter((_, i) => i !== index)
    })
  }

  const calculateTotal = () => {
    const subtotal = generateData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice)
    }, 0)
    const discount = parseFloat(generateData.discount) || 0
    const tax = parseFloat(generateData.tax) || 0
    return {
      subtotal,
      discount,
      tax,
      total: subtotal - discount + tax
    }
  }

  const handleGenerateBill = async () => {
    try {
      if (!generateData.patient) {
        toast.error('Please select a patient')
        return
      }
      if (generateData.items.length === 0) {
        toast.error('Please add at least one item')
        return
      }

      // Find the selected patient to get the userId
      const selectedPatient = patients.find(p => p._id === generateData.patient)
      
      console.log('🔍 Selected Patient:', selectedPatient)
      
      if (!selectedPatient) {
        toast.error('Patient not found')
        return
      }

      if (!selectedPatient.userId || !selectedPatient.userId._id) {
        console.error('❌ Patient structure:', selectedPatient)
        toast.error('Invalid patient data structure')
        return
      }

      const payload = {
        patient: selectedPatient.userId._id, // Send the userId._id instead of patient._id
        items: generateData.items,
        discount: parseFloat(generateData.discount) || 0,
        tax: parseFloat(generateData.tax) || 0,
        notes: generateData.notes
      }

      console.log('📤 Create Bill Payload:', payload)

      const response = await billingService.createBill(payload)
      console.log('✅ Bill Creation Response:', response)
      
      toast.success(response.data?.message || 'Bill generated successfully')
      setShowGenerateModal(false)
      resetGenerateForm()
      fetchBills()
      fetchStats()
    } catch (error) {
      console.error('❌ Generate bill error:', error)
      console.error('❌ Error response:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to generate bill')
    }
  }

  const handleRecordPayment = async () => {
    try {
      if (!paymentData.amount || paymentData.amount <= 0) {
        toast.error('Please enter a valid amount')
        return
      }
      if (!paymentData.paymentMethod) {
        toast.error('Please select a payment method')
        return
      }

      const payload = {
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId,
        notes: paymentData.notes
      }

      const response = await billingService.recordPayment(selectedBill._id, payload)
      toast.success(response.data?.message || 'Payment recorded successfully')
      setShowPaymentModal(false)
      resetPaymentForm()
      fetchBills()
      fetchStats()
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error.response?.data?.message || 'Failed to record payment')
    }
  }

  const handleProcessInsurance = async () => {
    try {
      if (!insuranceData.claimNumber || !insuranceData.provider || !insuranceData.amountClaimed) {
        toast.error('Please fill all insurance claim fields')
        return
      }

      const payload = {
        claimNumber: insuranceData.claimNumber,
        provider: insuranceData.provider,
        amountClaimed: parseFloat(insuranceData.amountClaimed)
      }

      const response = await billingService.processInsuranceClaim(selectedBill._id, payload)
      toast.success(response.data?.message || 'Insurance claim submitted successfully')
      setShowInsuranceModal(false)
      setInsuranceData({ claimNumber: '', provider: '', amountClaimed: '' })
      fetchBills()
    } catch (error) {
      console.error('Insurance error:', error)
      toast.error(error.response?.data?.message || 'Failed to submit insurance claim')
    }
  }

  const handleDeleteBill = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        const response = await billingService.deleteBill(id)
        toast.success(response.data?.message || 'Bill deleted successfully')
        fetchBills()
        fetchStats()
      } catch (error) {
        console.error('Delete error:', error)
        toast.error(error.response?.data?.message || 'Failed to delete bill')
      }
    }
  }

  const resetPaymentForm = () => {
    setPaymentData({
      amount: '',
      paymentMethod: '',
      transactionId: '',
      notes: ''
    })
  }

  const resetGenerateForm = () => {
    setGenerateData({
      patient: '',
      billDate: new Date().toISOString().split('T')[0],
      items: [],
      discount: 0,
      tax: 0,
      notes: ''
    })
    setNewItem({
      description: '',
      category: 'Consultation',
      quantity: 1,
      unitPrice: 0
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Partially-Paid':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'Unpaid':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'Refunded':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const columns = [
    { header: 'Bill Number', accessor: 'billNumber' },
    {
      header: 'Patient',
      accessor: 'patient',
      render: (row) => {
        const patientName = row.patient?.userId?.name || 'Unknown'
        const patientId = row.patient?.patientId || 'N/A'
        return (
          <div>
            <p className="font-medium text-sm">{patientName}</p>
            <p className="text-xs text-gray-500">{patientId}</p>
          </div>
        )
      }
    },
    {
      header: 'Date',
      accessor: 'billDate',
      render: (row) => <span className="text-sm">{new Date(row.billDate).toLocaleDateString()}</span>
    },
  
    {
      header: 'Total Amount',
      accessor: 'totalAmount',
      render: (row) => <span className="font-semibold text-sm">₹{row.totalAmount?.toFixed(2)}</span>
    },
    {
      header: 'Paid',
      accessor: 'amountPaid',
      render: (row) => <span className="text-green-600 font-semibold text-sm">₹{row.amountPaid?.toFixed(2)}</span>
    },
    {
      header: 'Balance',
      accessor: 'balance',
      render: (row) => (
        <span className={`font-semibold text-sm ${row.balance > 0 ? 'text-red-600' : 'text-gray-500'}`}>
          ₹{row.balance?.toFixed(2)}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'paymentStatus',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.paymentStatus)}`}>
          {row.paymentStatus}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex space-x-1">
          <button
            onClick={() => {
              setSelectedBill(row)
              setShowInvoiceModal(true)
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
            title="View Invoice"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {row.balance > 0 && (
            <>
              <button
                onClick={() => {
                  setSelectedBill(row)
                  setPaymentData({ ...paymentData, amount: row.balance })
                  setShowPaymentModal(true)
                }}
                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                title="Record Payment"
              >
                <CreditCard className="w-3.5 h-3.5" />
              </button>
              {!row.insuranceClaim && (
                <button
                  onClick={() => {
                    setSelectedBill(row)
                    setInsuranceData({ claimNumber: '', provider: '', amountClaimed: row.balance.toString() })
                    setShowInsuranceModal(true)
                  }}
                  className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition"
                  title="Insurance Claim"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
          {row.amountPaid === 0 && (
            <button
              onClick={() => handleDeleteBill(row._id)}
              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Billing & Payment
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage invoices and track payments</p>
        </div>
        <button
          onClick={() => {
            resetGenerateForm()
            setShowGenerateModal(true)
          }}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Invoice</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
              <h3 className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                ₹{(stats.totalRevenue || 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Collected</p>
              <h3 className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                ₹{(stats.totalCollected || 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Pending</p>
              <h3 className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                ₹{(stats.totalPending || 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Invoices</p>
              <h3 className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {stats.totalBills || 0}
              </h3>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <TableComponent
        columns={columns}
        data={bills}
        loading={loading}
        searchPlaceholder="Search bills by number, patient name..."
      />

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate New Invoice"
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <User className="w-4 h-4 inline mr-2" />
                Select Patient *
              </label>
              <select
                value={generateData.patient}
                onChange={(e) => setGenerateData({ ...generateData, patient: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select Patient ({patients.length} available)</option>
                {patients.map((patient) => {
                  const patientName = patient?.userId?.name || 'Unknown'
                  const patientId = patient?.patientId || 'N/A'
                  
                  return (
                    <option key={patient._id} value={patient._id}>
                      {patientName} - {patientId}
                    </option>
                  )
                })}
              </select>
              {patients.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  No patients found. Please add patient profiles first.
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Calendar className="w-4 h-4 inline mr-2" />
                Date *
              </label>
              <input
                type="date"
                value={generateData.billDate}
                onChange={(e) => setGenerateData({ ...generateData, billDate: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                } focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          {/* Add Item Section */}
          <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
            <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Add Service/Item
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-4">
                <label className="block text-xs text-gray-500 mb-1">Service</label>
                <select
                  value={newItem.description}
                  onChange={(e) => {
                    const template = serviceTemplates.find(t => t.name === e.target.value)
                    setNewItem({
                      ...newItem,
                      description: e.target.value,
                      category: template ? template.category : 'Other',
                      unitPrice: template ? template.price : 0
                    })
                  }}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select service</option>
                  {serviceTemplates.map((template) => (
                    <option key={template.name} value={template.name}>{template.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Lab Test">Lab Test</option>
                  <option value="Imaging">Imaging</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Room Charges">Room Charges</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  } focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div className="md:col-span-2 flex items-end">
                <button
                  onClick={addItem}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Items List */}
          {generateData.items.length > 0 && (
            <div className={`rounded-lg border overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <table className="w-full">
                <thead className={`${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {generateData.items.map((item, index) => (
                    <tr key={index} className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                      <td className="px-4 py-3 text-sm">{item.description}</td>
                      <td className="px-4 py-3 text-sm">{item.category}</td>
                      <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-right">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">
                        ₹{(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          {generateData.items.length > 0 && (
            <div className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={generateData.discount}
                    onChange={(e) => setGenerateData({ ...generateData, discount: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tax (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={generateData.tax}
                    onChange={(e) => setGenerateData({ ...generateData, tax: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    } focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
              <div className="space-y-2 border-t border-gray-300 dark:border-gray-600 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    ₹{calculateTotal().subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount:</span>
                  <span className="text-red-600 font-medium">
                    -₹{calculateTotal().discount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    +₹{calculateTotal().tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-300 dark:border-gray-600 pt-2">
                  <span>Total:</span>
                  <span className="text-blue-600">₹{calculateTotal().total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Additional Notes
            </label>
            <textarea
              value={generateData.notes}
              onChange={(e) => setGenerateData({ ...generateData, notes: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              rows="3"
              placeholder="Any additional notes or comments..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowGenerateModal(false)}
            className={`px-6 py-2 rounded-lg border ${
              darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
            } transition`}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateBill}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
          >
            Generate Invoice
          </button>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment"
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Amount *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter payment amount"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Payment Method *
            </label>
            <select
              value={paymentData.paymentMethod}
              onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select payment method</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Transaction ID (Optional)
            </label>
            <input
              type="text"
              value={paymentData.transactionId}
              onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter transaction ID"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Notes (Optional)
            </label>
            <textarea
              value={paymentData.notes}
              onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              rows="3"
              placeholder="Any additional notes..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowPaymentModal(false)}
            className={`px-6 py-2 rounded-lg border ${
              darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
            } transition`}
          >
            Cancel
          </button>
          <button
            onClick={handleRecordPayment}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition"
          >
            Record Payment
          </button>
        </div>
      </Modal>

      {/* Insurance Modal */}
      <Modal
        isOpen={showInsuranceModal}
        onClose={() => setShowInsuranceModal(false)}
        title="Submit Insurance Claim"
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Claim Number *
            </label>
            <input
              type="text"
              value={insuranceData.claimNumber}
              onChange={(e) => setInsuranceData({ ...insuranceData, claimNumber: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter claim number"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Insurance Provider *
            </label>
            <input
              type="text"
              value={insuranceData.provider}
              onChange={(e) => setInsuranceData({ ...insuranceData, provider: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter insurance provider name"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Amount Claimed *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={insuranceData.amountClaimed}
              onChange={(e) => setInsuranceData({ ...insuranceData, amountClaimed: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter claimed amount"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowInsuranceModal(false)}
            className={`px-6 py-2 rounded-lg border ${
              darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
            } transition`}
          >
            Cancel
          </button>
          <button
            onClick={handleProcessInsurance}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
          >
            Submit Claim
          </button>
        </div>
      </Modal>

      {/* Invoice View Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Invoice Details"
        size="xl"
      >
        {selectedBill && (
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="flex justify-between items-start pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Invoice #{selectedBill.billNumber}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Date: {new Date(selectedBill.billDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedBill.paymentStatus)}`}>
                  {selectedBill.paymentStatus}
                </span>
              </div>
            </div>

            {/* Patient Info */}
            <div>
              <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Patient Information
              </h3>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {selectedBill.patient?.userId?.name || 'Unknown'}
                </p>
                <p className="text-sm text-gray-500">
                  Patient ID: {selectedBill.patient?.patientId || 'N/A'}
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Items
              </h3>
              <div className={`rounded-lg border overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {selectedBill.items?.map((item, index) => (
                      <tr key={index} className={darkMode ? 'bg-gray-800' : 'bg-white'}>
                        <td className="px-4 py-3 text-sm">{item.description}</td>
                        <td className="px-4 py-3 text-sm">{item.category}</td>
                        <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-right">₹{item.unitPrice?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">
                          ₹{((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    ₹{selectedBill.subtotal?.toFixed(2)}
                  </span>
                </div>
                {selectedBill.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount:</span>
                    <span className="text-red-600 font-medium">
                      -₹{selectedBill.discount?.toFixed(2)}
                    </span>
                  </div>
                )}
                {selectedBill.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax:</span>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      +₹{selectedBill.tax?.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-300 dark:border-gray-600 pt-2">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">₹{selectedBill.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount Paid:</span>
                  <span className="text-green-600 font-semibold">
                    ₹{selectedBill.amountPaid?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Balance Due:</span>
                  <span className={selectedBill.balance > 0 ? 'text-red-600' : 'text-gray-500'}>
                    ₹{selectedBill.balance?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {selectedBill.paymentHistory && selectedBill.paymentHistory.length > 0 && (
              <div>
                <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Payment History
                </h3>
                <div className="space-y-2">
                  {selectedBill.paymentHistory.map((payment, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            ₹{payment.amount?.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.paymentMethod} • {new Date(payment.date).toLocaleDateString()}
                          </p>
                        </div>
                        {payment.transactionId && (
                          <p className="text-xs text-gray-500">
                            Trans ID: {payment.transactionId}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedBill.notes && (
              <div>
                <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notes
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedBill.notes}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowInvoiceModal(false)}
            className={`px-6 py-2 rounded-lg border ${
              darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'
            } transition`}
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
          >
            <Download className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Billing