import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { darkMode } = useTheme()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div
          className={`inline-block align-bottom ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full`}
        >
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} px-6 py-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'} flex items-center justify-between`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal