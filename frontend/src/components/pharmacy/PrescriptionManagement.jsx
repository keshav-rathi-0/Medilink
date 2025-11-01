import React, { useState } from 'react'
import { FileText, User, Calendar, Pill, Check } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const PrescriptionManagement = ({ prescriptions, onDispense }) => {
  const { darkMode } = useTheme()
  const [filter, setFilter] = useState('pending') // pending, dispensed, all

  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (filter === 'all') return true
    return prescription.status.toLowerCase() === filter
  })

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {['pending', 'dispensed', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Prescriptions List */}
      <div className="space-y-3">
        {filteredPrescriptions.map((prescription) => (
          <div
            key={prescription.id}
            className={`p-4 rounded-lg border ${
              darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {prescription.prescriptionId}
                  </p>
                  <p className="text-sm text-gray-500">{prescription.date}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                prescription.status === 'Dispensed'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {prescription.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Patient</p>
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {prescription.patient}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Doctor</p>
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {prescription.doctor}
                  </p>
                </div>
              </div>
            </div>

            {/* Medicines List */}
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-gray-500">Prescribed Medicines:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {prescription.medicines.map((medicine, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg flex items-center space-x-2 ${
                      darkMode ? 'bg-gray-750' : 'bg-gray-50'
                    }`}
                  >
                    <Pill className="w-4 h-4 text-blue-600" />
                    <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {medicine}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            {prescription.status === 'Pending' && (
              <button
                onClick={() => onDispense(prescription.id)}
                className="w-full md:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Mark as Dispensed</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredPrescriptions.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No prescriptions found</p>
        </div>
      )}
    </div>
  )
}

export default PrescriptionManagement