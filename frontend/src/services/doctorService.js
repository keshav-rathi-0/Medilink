import api from './api'

export const getAllDoctors = async (params) => {
  return await api.get('/doctors', { params })
}

export const getDoctorById = async (id) => {
  return await api.get(`/doctors/${id}`)
}

export const getDoctorSchedule = async (id, params) => {
  return await api.get(`/doctors/${id}/schedule`, { params })
}

export const updateDoctorSchedule = async (id, data) => {
  return await api.put(`/doctors/${id}/schedule`, data)
}

export const getDoctorAppointments = async (id, params) => {
  return await api.get(`/doctors/${id}/appointments`, { params })
}