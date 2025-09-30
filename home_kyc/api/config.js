// src/api/config.js

const API_BASE_URL = 'http://localhost:4000';

// API endpoints
export const API_ENDPOINTS = {
  BUSINESS: {
    SUBMIT: `${API_BASE_URL}/api/business`,
    CONFIRM_OTP: `${API_BASE_URL}/api/confirm-business`
  },
  INDIVIDUAL: {
    SUBMIT: `${API_BASE_URL}/api/individual`,
    CONFIRM_OTP: `${API_BASE_URL}/api/confirm-individual`
  }
};