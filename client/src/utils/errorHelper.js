/**
 * Utility to extract user-friendly error messages from API response / network errors.
 * Distinguishes between 401 Auth, 403 Forbidden, 404 Not Found, 500 Server Error, and Network/CORS failures.
 *
 * @param {Error|object} error - Axios error object or standard Error
 * @param {string} defaultMessage - Fallback error string
 * @returns {string} Human readable diagnostic error message
 */
export function getApiErrorMessage(error, defaultMessage = 'An unexpected error occurred') {
  if (!error) return defaultMessage

  // Extract explicit message from backend response body if present
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  // Network / CORS / Server Unreachable Error (no HTTP response received)
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
    return 'Network Error: Cannot connect to server. Check backend API URL or CORS policy.'
  }

  // HTTP Status code fallback messages
  const status = error.response?.status
  if (status === 401) {
    return 'Authentication required. Please log in again.'
  }
  if (status === 403) {
    return 'Access denied. You do not have permission for this action.'
  }
  if (status === 404) {
    return 'Requested API route or resource not found (404).'
  }
  if (status >= 500) {
    return `Server Error (${status}). Please try again later.`
  }

  return error.message || defaultMessage
}
