import React from 'react'
import { Bed, Users, Activity, ClipboardList, AlertCircle } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import StatCard from '../common/StatCard'

const NurseDashboard = () => {
  const { darkMode } = useTheme()

  const assignedPatients = [
    {
      id: 1,
      name: 'John Smith',
      bedNumber: 'B101',
      ward: 'General Ward A',
      condition: 'Stable',
      lastCheckup: '2 hours ago',
      vitals: { bp: '120/80', temp: '98.6°F', pulse: '72 bpm' }
    },
    {
      id: 2,
      name: 'Emma Johnson',
      bedNumber: 'B102',
      ward: 'General Ward A',
      condition: 'Critical',
      lastCheckup: '30 minutes ago',
      vitals: { bp: '140/90', temp: '101°F', pulse: '95 bpm' }
    },
    {
      id: 3,
      name: 'Robert Davis',
      bedNumber: 'B104',
      ward: 'General Ward A',
      condition: 'Stable',
      lastCheckup: '1 hour ago',
      vitals: { bp: '118/75', temp: '98.2°F', pulse: '68 bpm' }
    }
  ]

  const tasks = [
    { id: 1, task: 'Administer medication to B101', time: '10:00 AM', priority: 'High', completed: false },
    { id: 2, task: 'Check vitals for B102', time: '10:30 AM', priority: 'Critical', completed: false },
    { id: 3, task: 'Change IV for B104', time: '11:00 AM', priority: 'Medium', completed: true },
    { id: 4, task: 'Wound dressing for ICU-05', time: '11:30 AM', priority: 'High', completed: false }
  ]

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'High':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default:
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    }
  }

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Critical':
        return 'text-red-600'
      case 'Stable':
        return 'text-green-600'
      case 'Moderate':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Nurse Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Monitor your assigned patients and tasks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Assigned Patients"
          value={assignedPatients.length}
          icon={Users}
          color="from-blue-600 to-cyan-600"
        />
        <StatCard
          title="Critical Patients"
          value={assignedPatients.filter(p => p.condition === 'Critical').length}
          icon={AlertCircle}
          color="from-red-600 to-pink-600"
        />
        <StatCard
          title="Pending Tasks"
          value={tasks.filter(t => !t.completed).length}
          icon={ClipboardList}
          color="from-orange-600 to-yellow-600"
        />
        <StatCard
          title="Ward Beds"
          value="15/20"
          icon={Bed}
          color="from-green-600 to-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Patients */}
        <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Assigned Patients
          </h2>
          <div className="space-y-4">
            {assignedPatients.map((patient) => (
              <div
                key={patient.id}
                className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-semibold">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {patient.name}
                      </p>
                      <p className="text-sm text-gray-500">{patient.ward} - {patient.bedNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold ${getConditionColor(patient.condition)}`}>
                      {patient.condition}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{patient.lastCheckup}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                    <p className="text-xs text-gray-500">BP</p>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {patient.vitals.bp}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                    <p className="text-xs text-gray-500">Temp</p>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {patient.vitals.temp}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                    <p className="text-xs text-gray-500">Pulse</p>
                    <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {patient.vitals.pulse}
                    </p>
                  </div>
                </div>
                <button className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                  Update Vitals
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Tasks */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Today's Tasks
          </h2>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-lg border ${
                  task.completed
                    ? darkMode ? 'border-gray-700 bg-gray-750 opacity-60' : 'border-gray-200 bg-gray-50 opacity-60'
                    : darkMode ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    className="w-5 h-5 mt-0.5 text-blue-600 rounded focus:ring-blue-500"
                    readOnly
                  />
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${
                      task.completed
                        ? 'line-through text-gray-500'
                        : darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {task.task}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">{task.time}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NurseDashboard