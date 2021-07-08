const isDevelopment = process.env.NODE_ENV === 'development'
const logger = (name, fn) => (...args) => {
  const showPerformance = localStorage.getItem('enableDevPerformanceTesting') === 'true'
  if (isDevelopment && showPerformance) {
    console.count(name)
    console.log(...args)
    console.time(name)
  }
  const result = fn.apply(null, args)
  if (isDevelopment && showPerformance) console.timeEnd(name)
  return result
}

export default logger
