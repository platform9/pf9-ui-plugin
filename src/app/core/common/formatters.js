// Converting the value(bytes) to output unit(optional) with commas
export const formattedValue = (bytes, unit='Bytes', dicimalDigit=2) => {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const addComma = (num) => {
    console.log((num-Math.floor(num)))
    let floorPart = Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    let roundPart = Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    let decimalPart = (num-Math.floor(num)).toFixed(dicimalDigit).substring(2)
    if (dicimalDigit===0) return roundPart
    else if ((num-Math.floor(num)).toFixed(dicimalDigit).startsWith('1')) return roundPart+'.'+decimalPart
    return floorPart+'.'+decimalPart
  }
  if (bytes===undefined || isNaN(bytes) || bytes<0) return 'Invalid value input.'
  if (dicimalDigit<0) return 'Invalid decimal digits input.'
  if (unit==='' || bytes===0) return addComma(bytes)+' Bytes'
  if (units.indexOf(unit)===-1) {
    return 'Output unit not found.'
  }
  let pos = units.indexOf(unit)
  return addComma(bytes/Math.pow(1024, pos))+' '+unit
}

// Transfer date obj into string like 'Jan 1, 2018 12:10:24'
export const formattedDate = (date) => {
  if (date === undefined || isNaN(date)) return 'Invalid date input.'
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const leadingzero = (str) => (('0'+str).slice(-2))
  return months[date.getMonth()]+' '+date.getDate()+', '+date.getFullYear()+
  ' '+leadingzero(date.getHours())+':'+leadingzero(date.getMinutes())+':'+
  leadingzero(date.getSeconds())
}
