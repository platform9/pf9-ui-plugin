import moment from 'moment'

export const range = count => {
  const arr = []
  for (let i = 0; i < count; i++) {
    arr.push(i)
  }
  return arr
}

export const getCurrentTime = (format='YYYY-MM-DDTHH:mm:ss.SSS[Z]') => moment().format(format)
