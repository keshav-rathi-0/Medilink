import api from './api'

export const getAllPatients = async (params) => {
  return await api.get('/patients', { params })
}

export const getPatientById = async (id) => {
  return await api.get(`/patients/${id}`)
}

export const createPatient = async (data) => {
  return await api.post('/patients', data)
}

export const updatePatient = async (id, data) => {
  return await api.put(`/patients/${id}`, data)
}

export const deletePatient = async (id) => {
  return await api.delete(`/patients/${id}`)
}

export const getPatientHistory = async (id) => {
  return await api.get(`/patients/${id}/history`)
}

export const getPatientPrescriptions = async (id) => {
  return await api.get(`/patients/${id}/prescriptions`)
}

export const getPatientBills = async (id) => {
  return await api.get(`/patients/${id}/bills`)
}