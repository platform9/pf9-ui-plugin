// Base template for handling k8s object models
import uuid from 'uuid'

const createModel = (options={}) => {
  const {
    dataKey,
    uniqueIdentifier = 'id',
    defaults,
    loaderFn, // function that maps data into a different form for API route
    mappingFn, // data coming form API, context needs it in a different format
    onDeleteFn,
  } = options

  return {
    create: (data, context) => {
      const mappedData = mappingFn ? mappingFn(data, context) : data
      const newObject = { [uniqueIdentifier]: uuid.v4(), ...defaults, ...mappedData }
      context[dataKey].push(newObject)
      return newObject
    },

    list: (context) => {
      return loaderFn ? loaderFn(context[dataKey]) : context[dataKey]
    },

    update: (id, data, context) => {
      const mappedData = mappingFn ? mappingFn(data, context) : data
      context[dataKey] = context[dataKey].map(x => x[uniqueIdentifier] === id ? {...x, ...mappedData} : x)
      return context[dataKey].find(x => x[uniqueIdentifier] === id)
    },

    delete: (id, context) => {
      const obj = context[dataKey].find(x => x[uniqueIdentifier] === id)
      if (onDeleteFn) { onDeleteFn(id, context, obj) }
      context[dataKey] = context[dataKey].filter(x => x[uniqueIdentifier] !== id)
    },
  }
}

export default createModel
