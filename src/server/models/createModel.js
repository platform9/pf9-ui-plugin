// Base template for handling k8s object models
import uuid from 'uuid'

// Filter list by cluster and namespace if necessary
const filterListByConfig = (list, config) => {
  let _list = list.slice()
  if (config.clusterId) {
    _list = _list.filter((obj) => {
      return obj.clusterId === config.clusterId
    })
  }
  if (config.namespace) {
    _list = _list.filter((obj) => {
      return obj.namespace === config.namespace
    })
  }
  return _list
}

const createModel = (options={}) => {
  const {
    dataKey,
    uniqueIdentifier = 'id',
    defaults = {},
    createFn,
    loaderFn, // function that maps data into a different form for API route
    mappingFn, // data coming form API, context needs it in a different format
    onDeleteFn,
  } = options

  return {
    create: ({data, context, raw=false, config={}}) => {
      // In kubernetes, need to track clusterId and namespace
      if (config.clusterId) {
        data.clusterId = config.clusterId
      }
      if (config.namespace) {
        data.namespace = config.namespace
      }

      const createdData = createFn ? createFn(data, context) : data
      const mappedData = mappingFn ? mappingFn(createdData, context) : createdData
      const newObject = {
        [uniqueIdentifier]: uuid.v4(),
        ...defaults,
        ...mappedData
      }
      context[dataKey].push(newObject)
      return (!raw && loaderFn) ? loaderFn([newObject])[0] : newObject
    },

    list: ({context, raw=false, config={}}) => {
      const list = filterListByConfig(context[dataKey], config)
      return (!raw && loaderFn) ? loaderFn(list) : list
    },

    update: ({id, data, context}) => {
      const mappedData = mappingFn ? mappingFn(data, context) : data
      context[dataKey] = context[dataKey].map(x => x[uniqueIdentifier] === id ? {...x, ...mappedData} : x)
      return context[dataKey].find(x => x[uniqueIdentifier] === id)
    },

    delete: ({id, context}) => {
      const obj = context[dataKey].find(x => x[uniqueIdentifier] === id)
      if (onDeleteFn) { onDeleteFn(id, context, obj) }
      context[dataKey] = context[dataKey].filter(x => x[uniqueIdentifier] !== id)
    },

    findById: ({id, context, raw=false}) => {
      const obj = context[dataKey].find(x => x[uniqueIdentifier] === id)
      return (!raw && loaderFn) ? loaderFn([obj])[0] : obj
    },

    findByName: ({name, context, raw=false, config={}}) => {
      const list = filterListByConfig(context[dataKey], config)
      const obj = list.find((x) => {
        return x.name === name
      })
      return (!raw && loaderFn) ? loaderFn([obj])[0] : obj
    }
  }
}

export default createModel
