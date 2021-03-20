class ApiError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ApiError'
  }
}

export function isApiError(err: any): err is ApiError {
  return err instanceof ApiError
}

export default ApiError
