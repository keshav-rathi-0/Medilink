import api from './api'

export const getAllBills = async (params) => {
  return await api.get('/billing', { params })
}

export const getBillById = async (id) => {
  return await api.get(`/billing/${id}`)
}

export const createBill = async (data) => {
  return await api.post('/billing', data)
}

export const updateBill = async (id, data) => {
  return await api.put(`/billing/${id}`, data)
}

export const generateInvoice = async (id) => {
  return await api.get(`/billing/${id}/invoice`, {
    responseType: 'blob'
  })
}

export const recordPayment = async (id, data) => {
  return await api.post(`/billing/${id}/payment`, data)
}