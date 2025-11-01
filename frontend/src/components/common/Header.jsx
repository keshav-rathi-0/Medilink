import React, { useState } from 'react'
import { Search, Bell, Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const Header = () => {
  const { darkMode, toggleDarkMode, toggleSidebar } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <Menu className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients, doctors, appointments..."
              className={`pl-10 pr-4 py-2 w-96 rounded-lg border ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                  : 'bg-gray-50 border-gray-200 text-gray-800'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className={`p-2 rounded-lg relative ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
            <Bell className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            {darkMode ? (
              <Sun className="w-6 h-6 text-gray-300" />
            ) : (
              <Moon className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header