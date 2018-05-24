// Converting the value and unit(optional) to the most convinient unit with commas
export const formattedValue = (value, unit='') => {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const addComma = (num) => (num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','))
  if (value === undefined || isNaN(value)) return 'Wrong value input.'
  if (unit === '' || units.indexOf(unit) === -1) {
    return addComma(value)
  }
  if (unit.length>0) {
    let pos = units.indexOf(unit)
    while (value>=1024 && pos<units.length-1) {
      value/=1024
      pos++
    }
    return (addComma(value))+' '+units[pos]
  }
}

// Transfer date obj into string like 'Jan 1, 2018 12:10:24'
export const formattedDate = (date) => {
  if (date === undefined || isNaN(date)) return 'Wrong date input.'
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const leadingzero = (str) => (('0'+str).slice(-2))
  return months[date.getMonth()]+' '+date.getDate()+', '+date.getFullYear()+
  ' '+leadingzero(date.getHours())+':'+leadingzero(date.getMinutes())+':'+
  leadingzero(date.getSeconds())
}
