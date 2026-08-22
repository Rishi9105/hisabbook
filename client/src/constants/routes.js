export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CREATE_LOAN: '/loans/new',
  LOAN_DETAILS: (id) => `/loans/${id}`,
  ADD_PAYMENT: (id) => `/loans/${id}/payment`,
  SETTINGS: '/settings',
}
