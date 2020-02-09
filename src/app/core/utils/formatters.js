import moment from 'moment'

// Converting the value(bytes) to output unit(optional) with commas
export const formattedValue = (bytes, unit = 'Bytes', decimalDigits = 2) => {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  if (bytes === undefined || isNaN(bytes) || bytes < 0) return 'Invalid value input.'
  if (decimalDigits < 0) return 'Invalid decimal digits input.'
  if (unit === '' || bytes === 0) return addComma(bytes, decimalDigits) + ' Bytes'
  if (units.indexOf(unit) === -1) {
    return 'Output unit not found.'
  }
  const pos = units.indexOf(unit)
  return addComma(bytes / Math.pow(1024, pos), decimalDigits) + ' ' + unit
}

export const addComma = (num, decimalDigits = 2) => {
  const floorPart = Math.floor(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const roundPart = Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const decimalPart = (num - Math.floor(num)).toFixed(decimalDigits).substring(2)
  if (decimalDigits === 0) return roundPart
  else if ((num - Math.floor(num)).toFixed(decimalDigits).startsWith('1')) {
    return roundPart + '.' + decimalPart
  }
  return floorPart + '.' + decimalPart
}

// Transfer UTC time string into string like 'Jan 1, 2018 12:10:24' in local time.
export const formattedDate = (str) => {
  if (!str || !moment(str).isValid()) return 'Invalid date input.'
  return moment(str).format('lll')
}
