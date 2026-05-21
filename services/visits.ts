import api from './api';

export const getHosts = () => api.get('/visits/hosts');

export const getVisitorByPhone = (phone: string) =>
  api.get(`/visits/visitors/phone/${encodeURIComponent(phone)}`);

export const createVisit = (data: object) => api.post('/visits', data);

export const getVisitStatus = (id: number) =>
  api.get(`/visits/status/${id}`);

export const getVisitPass = (visitId: string) =>
  api.get(`/visits/pass/${visitId}`);

export const recoverPass = (phone: string) =>
  api.get(`/visits/recover/${encodeURIComponent(phone)}`);
