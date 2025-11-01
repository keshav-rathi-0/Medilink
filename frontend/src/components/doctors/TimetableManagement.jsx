import React, { useState } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { toast } from 'react-toastify'

const TimetableManagement = ({ doctorId, currentTimetable, onSave }) => {
  const { darkMode } = useTheme()
  const [timetable, setTimetable] = useState(currentTimetable || {
    monday: { available: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    tuesday: { available: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    wednesday: { available: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    thursday: { available: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    friday: { available: false, startTime: '09:00', endTime: '17:00', breaks: [] },
    saturday: { available: false, startTime: '09:00', endTime: '14:00', breaks: [] },
    sunday: { available: false, startTime: '09:00', endTime: '14:00', breaks: [] }
  })

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  const toggleDay = (day) => {
    setTimetable(prev => ({
      ...prev,
      [day]: { ...prev[day], available: !prev[day].available }
    }))
  }

  const updateTime = (day, field, value) => {
    setTimetable(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }))
  }

  const addBreak = (day) => {
    setTimetable(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        breaks: [...prev[day].breaks, { start: '12:00', end: '13:00' }]
      }
    }))
  }

  const removeBreak = (day, index) => {
    setTimetable(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        breaks: prev[day].breaks.filter((_, i) => i !== index)
      }
    }))
  }

  const updateBreak = (day, index, field, value) => {
    setTimetable(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        breaks: prev[day].breaks.map((brk, i) => 
          i === index ? { ...brk, [field]: value } : brk
        )
      }
    }))
  }

  const handleSave = () => {
    onSave(timetable)
    toast.success('Timetable updated successfully')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Manage Timetable
          </h3>
          <p className="text-gray-500 mt-1">Set working hours and breaks for each day</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Save className="w-5 h-5" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="space-y-3">
        {days.map((day) => (
          <div
            key={day}
            className={`p-4 rounded-lg border ${
              darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={timetable[day].available}
                  onChange={() => toggleDay(day)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className={`text-sm font-semibold capitalize ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {day}
                </label>
              </div>
              {timetable[day].available && (
                <button
                  onClick={() => addBreak(day)}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Break</span>
                </button>
              )}
            </div>

            {timetable[day].available && (
              <div className="space-y-3 ml-8">
                {/* Working Hours */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={timetable[day].startTime}
                      onChange={(e) => updateTime(day, 'startTime', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Time</label>
                    <input
                      type="time"
                      value={timetable[day].endTime}
                      onChange={(e) => updateTime(day, 'endTime', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>

                {/* Breaks */}
                {timetable[day].breaks.map((brk, index) => (
                  <div key={index} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500">Break {index + 1}</span>
                      <button
                        onClick={() => removeBreak(day, index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={brk.start}
                        onChange={(e) => updateBreak(day, index, 'start', e.target.value)}
                        className={`px-2 py-1 rounded border text-sm ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500`}
                      />
                      <input
                        type="time"
                        value={brk.end}
                        onChange={(e) => updateBreak(day, index, 'end', e.target.value)}
                        className={`px-2 py-1 rounded border text-sm ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TimetableManagement