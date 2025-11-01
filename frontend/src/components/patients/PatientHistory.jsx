import React from 'react'
import { Calendar, FileText, Activity, Pill } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const PatientHistory = ({ patientId }) => {
  const { darkMode } = useTheme()

  const historyItems = [
    {
      id: 1,
      date: '2024-10-25',
      type: 'consultation',
      doctor: 'Dr. Sarah Wilson',
      diagnosis: 'Hypertension',
      prescription: 'Amlodipine 5mg',
      notes: 'Blood pressure under control'
    },
    {
      id: 2,
      date: '2024-09-15',
      type: 'lab',
      testName: 'Complete Blood Count',
      result: 'Normal',
      notes: 'All parameters within normal range'
    },
    {
      id: 3,
      date: '2024-08-10',
      type: 'consultation',
      doctor: 'Dr. Michael Brown',
      diagnosis: 'Common Cold',
      prescription: 'Paracetamol 500mg',
      notes: 'Symptoms resolved after 5 days'
    }
  ]

  const getTypeIcon = (type) => {
    switch (type) {
      case 'consultation':
        return <Activity className="w-5 h-5 text-blue-600" />
      case 'lab':
        return <FileText className="w-5 h-5 text-green-600" />
      case 'prescription':
        return <Pill className="w-5 h-5 text-purple-600" />
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'lab':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'prescription':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Medical History
      </h3>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"></div>

        <div className="space-y-6">
          {historyItems.map((item, index) => (
            <div key={item.id} className="relative pl-14">
              {/* Timeline Dot */}
              <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center">
                {getTypeIcon(item.type)}
              </div>

              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{item.date}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(item.type)}`}>
                    {item.type}
                  </span>
                </div>

                {item.type === 'consultation' && (
                  <div className="space-y-2">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {item.doctor}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Diagnosis:</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {item.diagnosis}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Prescription:</p>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {item.prescription}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{item.notes}</p>
                  </div>
                )}

                {item.type === 'lab' && (
                  <div className="space-y-2">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {item.testName}
                    </p>
                    <div className="text-sm">
                      <p className="text-gray-500">Result:</p>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {item.result}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PatientHistory