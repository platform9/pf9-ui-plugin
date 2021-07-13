const isDevelopment = process.env.NODE_ENV === 'development'
function logger<T>(name, fn) {
  return (...args): T => {
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
}

export default logger
