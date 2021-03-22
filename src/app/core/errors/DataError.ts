class DataError extends Error {
  constructor(message) {
    super(message)
    this.name = 'DataError'
  }
}

export function isDataError(err: any): err is DataError {
  return err instanceof DataError
}

export default DataError
