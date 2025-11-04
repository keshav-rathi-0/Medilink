import api from './api'

// Get all patients (directly from patient endpoint - same as Patients.jsx)
export const getAllPatients = async (params) => {
  try {
    return await api.get('/patients', { params })
  } catch (error) {
    console.error('Error fetching patients:', error)
    throw error
  }
}

// Get billing stats (MUST be called before other routes to avoid conflicts)
export const getBillingStats = async (params) => {
  try {
    return await api.get('/billing/stats', { params })
  } catch (error) {
    console.error('Error fetching billing stats:', error)
    throw error
  }
}

// Get all bills
export const getAllBills = async (params) => {
  try {
    return await api.get('/billing', { params })
  } catch (error) {
    console.error('Error fetching bills:', error)
    throw error
  }
}

// Get bill by ID
export const getBillById = async (id) => {
  try {
    return await api.get(`/billing/${id}`)
  } catch (error) {
    console.error('Error fetching bill:', error)
    throw error
  }
}

// Create new bill
export const createBill = async (data) => {
  try {
    console.log('Creating bill with data:', data)
    const response = await api.post('/billing', data)
    console.log('Bill created:', response)
    return response
  } catch (error) {
    console.error(' Error creating bill:', error.response?.data || error.message)
    throw error
  }
}

// Update bill
export const updateBill = async (id, data) => {
  try {
    return await api.put(`/billing/${id}`, data)
  } catch (error) {
    console.error('Error updating bill:', error)
    throw error
  }
}

// Generate invoice (PDF download)
export const generateInvoice = async (id) => {
  try {
    return await api.get(`/billing/${id}/invoice`, {
      responseType: 'blob'
    })
  } catch (error) {
    console.error('Error generating invoice:', error)
    throw error
  }
}

// Record payment
export const recordPayment = async (id, data) => {
  try {
    return await api.post(`/billing/${id}/payment`, data)
  } catch (error) {
    console.error('Error recording payment:', error)
    throw error
  }
}

// Process insurance claim
export const processInsuranceClaim = async (id, data) => {
  try {
    return await api.post(`/billing/${id}/insurance`, data)
  } catch (error) {
    console.error('Error processing insurance claim:', error)
    throw error
  }
}

// Update insurance claim
export const updateInsuranceClaim = async (id, data) => {
  try {
    return await api.put(`/billing/${id}/insurance`, data)
  } catch (error) {
    console.error('Error updating insurance claim:', error)
    throw error
  }
}

// Delete bill
export const deleteBill = async (id) => {
  try {
    return await api.delete(`/billing/${id}`)
  } catch (error) {
    console.error('Error deleting bill:', error)
    throw error
  }
}