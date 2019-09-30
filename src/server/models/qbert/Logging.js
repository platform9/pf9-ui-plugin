import createModel from '../createModel'

const options = {
  dataKey: 'loggings',
  uniqueIdentifier: 'cluster',
}

const Logging = createModel(options)

export default Logging
