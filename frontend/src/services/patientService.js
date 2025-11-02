import api from './api'

// Get all patients
export const getAllPatients = async (params) => {
  return await api.get('/patients', { params })
}

// Get all registered users with role "Patient" (users without patient profile)
export const getAvailablePatientUsers = async () => {
  return await api.get('/patients/available-users')
}

// Get patient by ID
export const getPatientById = async (id) => {
  return await api.get(`/patients/${id}`)
}

// Create patient profile for existing user
export const createPatient = async (data) => {
  try {
    console.log('📤 Creating patient profile...', data)
    
    const patientPayload = {
      userId: data.userId,
      bloodGroup: data.bloodGroup,
      emergencyContact: {
        name: data.emergencyContactName || '',
        phone: data.emergencyContact || '',
        relation: data.emergencyContactRelation || ''
      },
      allergies: data.allergies || [],
      insuranceInfo: data.insuranceInfo || {}
    }

    const patientResponse = await api.post('/patients', patientPayload)
    console.log('✅ Patient profile created successfully')
    
    return patientResponse
  } catch (error) {
    console.error('❌ Error creating patient:', error.response?.data || error.message)
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

// Update patient
export const updatePatient = async (id, data) => {
  try {
    console.log('📤 Updating patient...', { id, data })
    
    const payload = {
      bloodGroup: data.bloodGroup,
      emergencyContact: {
        name: data.emergencyContactName || '',
        phone: data.emergencyContact || '',
        relation: data.emergencyContactRelation || ''
      },
      allergies: data.allergies || [],
      insuranceInfo: data.insuranceInfo || {}
    }
    
    const response = await api.put(`/patients/${id}`, payload)
    console.log('✅ Patient updated successfully')
    
    return response
  } catch (error) {
    console.error('❌ Error updating patient:', error.response?.data || error.message)
    throw error
  }
}

// Delete patient
export const deletePatient = async (id) => {
  return await api.delete(`/patients/${id}`)
}

// Get patient medical records
export const getPatientMedicalRecords = async (id) => {
  return await api.get(`/patients/${id}/medical-records`)
}

// Add medical history
export const addMedicalHistory = async (id, data) => {
  return await api.post(`/patients/${id}/medical-history`, data)
}

// Add lab report
export const addLabReport = async (id, data) => {
  return await api.post(`/patients/${id}/lab-report`, data)
}

// Get patient appointments
export const getPatientAppointments = async (id) => {
  return await api.get(`/patients/${id}/appointments`)
}

// Create appointment for patient
export const createAppointment = async (data) => {
  return await api.post('/appointments', data)
}

// Get patient history
export const getPatientHistory = async (id) => {
  return await api.get(`/patients/${id}/history`)
}

// Get patient prescriptions
export const getPatientPrescriptions = async (id) => {
  return await api.get(`/patients/${id}/prescriptions`)
}

// Get patient bills
export const getPatientBills = async (id) => {
  return await api.get(`/patients/${id}/bills`)
}