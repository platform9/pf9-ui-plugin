import { combineReducers } from 'redux'

import plugins from './plugins'
import { exists } from './util/fp'

// loop through the reducers from the plugins
const reducersObj = plugins
  .filter(plugin => exists(plugin.reducer))
  .reduce(
    (accum, plugin) => ({
      ...accum,
      [plugin.__name__]: plugin.reducer
    }),
    {}
  )

const combinedReducers = combineReducers(reducersObj)

const initialState = {}
const reducer = (state = initialState, action) => {
  const { type, payload } = action // eslint-disable-line no-unused-vars

  const newState = combinedReducers(state, action)

  switch (type) {
    default:
      return newState
  }
}

export default reducer
