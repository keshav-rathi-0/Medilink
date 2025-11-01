import api from './api'

export const getAllAppointments = async (params) => {
  return await api.get('/appointments', { params })
}

export const getAppointmentById = async (id) => {
  return await api.get(`/appointments/${id}`)
}

export const createAppointment = async (data) => {
  return await api.post('/appointments', data)
}

export const updateAppointment = async (id, data) => {
  return await api.put(`/appointments/${id}`, data)
}

export const deleteAppointment = async (id) => {
  return await api.delete(`/appointments/${id}`)
}

export const getDoctorAvailability = async (doctorId, date) => {
  return await api.get(`/appointments/availability/${doctorId}`, {
    params: { date }
  })
}