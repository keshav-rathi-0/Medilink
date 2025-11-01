import React, { useState } from 'react'
import { Plus, DollarSign, FileText, Download, Eye, CreditCard, CheckCircle, Clock } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import TableComponent from '../components/common/TableComponent'
import Modal from '../components/common/Modal'
import { toast } from 'react-toastify'

const Billing = () => {
  const { darkMode } = useTheme()
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: '',
    transactionId: '',
    notes: ''
  })

  const bills = [
    {
      _id: '1',
      billId: 'BILL001',
      patient: 'John Smith',
      patientId: 'P001',
      date: '2024-10-30',
      services: ['Consultation', 'Blood Test', 'X-Ray'],
      totalAmount: 450,
      paidAmount: 450,
      balance: 0,
      status: 'Paid',
      paymentMethod: 'Credit Card'
    },
    {
      _id: '2',
      billId: 'BILL002',
      patient: 'Emma Johnson',
      patientId: 'P002',
      date: '2024-10-30',
      services: ['Surgery', 'Room Charges', 'Medicines'],
      totalAmount: 5500,
      paidAmount: 3000,
      balance: 2500,
      status: 'Partial',
      paymentMethod: 'Cash'
    },
    {
      _id: '3',
      billId: 'BILL003',
      patient: 'Robert Davis',
      patientId: 'P003',
      date: '2024-10-31',
      services: ['Consultation', 'ECG', 'Medicines'],
      totalAmount: 320,
      paidAmount: 0,
      balance: 320,
      status: 'Unpaid',
      paymentMethod: null
    },
    {
      _id: '4',
      billId: 'BILL004',
      patient: 'Lisa Anderson',
      patientId: 'P004',
      date: '2024-10-31',
      services: ['ICU Charges', 'Oxygen', 'Medicines'],
      totalAmount: 8900,
      paidAmount: 8900,
      balance: 0,
      status: 'Paid',
      paymentMethod: 'Insurance'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Partial':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'Unpaid':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const handlePayment = () => {
    toast.success('Payment recorded successfully')
    setShowPaymentModal(false)
    setPaymentData({
      amount: '',
      paymentMethod: '',
      transactionId: '',
      notes: ''
    })
  }

  const columns = [
    { header: 'Bill ID', accessor: 'billId' },
    {
      header: 'Patient',
      accessor: 'patient',
      render: (row) => (
        <div>
          <p className="font-semibold">{row.patient}</p>
          <p className="text-xs text-gray-500">{row.patientId}</p>
        </div>
      )
    },
    { header: 'Date', accessor: 'date' },
    {
      header: 'Services',
      accessor: 'services',
      render: (row) => (
        <div className="text-sm">
          {row.services.slice(0, 2).map((service, index) => (
            <div key={index} className="text-gray-600 dark:text-gray-400">{service}</div>
          ))}
          {row.services.length > 2 && (
            <span className="text-xs text-blue-600">+{row.services.length - 2} more</span>
          )}
        </div>
      )
    },
    {
      header: 'Total Amount',
      accessor: 'totalAmount',
      render: (row) => <span className="font-semibold">${row.totalAmount}</span>
    },
    {
      header: 'Paid',
      accessor: 'paidAmount',
      render: (row) => <span className="text-green-600 font-semibold">${row.paidAmount}</span>
    },
    {
      header: 'Balance',
      accessor: 'balance',
      render: (row) => (
        <span className={`font-semibold ${row.balance > 0 ? 'text-red-600' : 'text-gray-500'}`}>
          ${row.balance}
        </span>
      )
    },
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
              setSelectedBill(row)
              setShowInvoiceModal(true)
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
            title="View Invoice"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.balance > 0 && (
            <button
              onClick={() => {
                setSelectedBill(row)
                setPaymentData({ ...paymentData, amount: row.balance })
                setShowPaymentModal(true)
              }}
              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
              title="Record Payment"
            >
              <CreditCard className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => toast.success('Invoice downloaded')}
            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition"
            title="Download Invoice"
          >
            <Download className="w-4 h-4" />
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
            Billing & Payment
          </h1>
          <p className="text-gray-500 mt-1">Manage invoices and track payments</p>
        </div>
        <button
          onClick={() => setShowInvoiceModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Generate Invoice</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                ${bills.reduce((acc, bill) => acc + bill.totalAmount, 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Paid Amount</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                ${bills.reduce((acc, bill) => acc + bill.paidAmount, 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Amount</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                ${bills.reduce((acc, bill) => acc + bill.balance, 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Invoices</p>
              <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {bills.length}
              </h3>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <TableComponent
        columns={columns}
        data={bills}
        searchPlaceholder="Search bills by ID, patient name, or date..."
      />

      {/* Invoice Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title={selectedBill ? `Invoice - ${selectedBill.billId}` : 'Generate New Invoice'}
        size="lg"
      >
        {selectedBill ? (
          <div className="space-y-6">
            <div className="flex justify-between items-start pb-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  MediCare Hospital
                </h2>
                <p className="text-sm text-gray-500 mt-1">123 Medical Street, Healthcare City</p>
                <p className="text-sm text-gray-500">Phone: +1 234 567 8900</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Invoice #</p>
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {selectedBill.billId}
                </p>
                <p className="text-sm text-gray-500 mt-2">Date: {selectedBill.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Bill To:</p>
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {selectedBill.patient}
                </p>
                <p className="text-sm text-gray-500">Patient ID: {selectedBill.patientId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Payment Status:</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBill.status)}`}>
                  {selectedBill.status}
                </span>
              </div>
            </div>

            <div>
              <table className="w-full">
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Service</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedBill.services.map((service, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">{service}</td>
                      <td className="px-4 py-3 text-right">
                        ${(selectedBill.totalAmount / selectedBill.services.length).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Subtotal:</span>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  ${selectedBill.totalAmount}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Tax (0%):</span>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>$0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Total:</span>
                <span className="text-blue-600">${selectedBill.totalAmount}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-gray-500">Paid:</span>
                <span className="text-green-600 font-semibold">${selectedBill.paidAmount}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-gray-500">Balance:</span>
                <span className="text-red-600 font-semibold">${selectedBill.balance}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => toast.success('Invoice downloaded')}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
              >
                Download PDF
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Select a bill to view invoice details</p>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={`Record Payment - ${selectedBill?.billId}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter amount"
            />
            {selectedBill && (
              <p className="text-sm text-gray-500 mt-1">Balance Due: ${selectedBill.balance}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Payment Method
            </label>
            <select
              value={paymentData.paymentMethod}
              onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Payment Method</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="insurance">Insurance</option>
              <option value="bank_transfer">Bank Transfer</option>
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
              Notes
            </label>
            <textarea
              value={paymentData.notes}
              onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              } focus:ring-2 focus:ring-blue-500`}
              rows="3"
              placeholder="Additional notes"
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
            onClick={handlePayment}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition"
          >
            Record Payment
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Billing