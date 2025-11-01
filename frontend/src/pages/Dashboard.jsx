import React from 'react'
import { useAuth } from '../context/AuthContext'
import AdminDashboard from '../components/dashboard/AdminDashboard'
import DoctorDashboard from '../components/dashboard/DoctorDashboard'

const Dashboard = () => {
  const { user } = useAuth()

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />
      case 'doctor':
        return <DoctorDashboard />
      case 'patient':
        return <div>Patient Dashboard</div>
      case 'nurse':
        return <div>Nurse Dashboard</div>
      case 'receptionist':
        return <div>Receptionist Dashboard</div>
      default:
        return <AdminDashboard />
    }
  }

  return renderDashboard()
}

export default Dashboard