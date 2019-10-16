import createModel from '../createModel'

const options = {
  dataKey: 'loggings',
  uniqueIdentifier: 'cluster',
  loaderFn: (list) => list[0],
}

const Logging = createModel(options)

export default Logging
