import api from './api';

export const sendOtp = (phone: string, email: string) =>
  api.post('/otp/send', { phone, email });

export const verifyOtp = (phone: string, otp: string) =>
  api.post('/otp/verify', { phone, otp });
