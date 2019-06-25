import React from 'react'
import { mapObjIndexed } from 'ramda'
import { ensureFunction } from 'utils/fp'
import PropTypes from 'prop-types'
import { withAppContext } from 'core/AppContext'

class ParamsWrapper extends React.Component {
  state = this.props.defaultParams

  setParams = params => this.setState(params)

  render () {
    return this.props.children({
      setParams: this.setParams,
      params: this.state,
    })
  }
}

ParamsWrapper.propTypes = {
  defaultParams: PropTypes.object,
}

ParamsWrapper.defaultProps = {
  defaultParams: {},
}

const withParams = defaultParams => Component => withAppContext(props => {
  const parsedDefaultParams = mapObjIndexed(param => ensureFunction(param)(props), defaultParams)
  return <ParamsWrapper defaultParams={parsedDefaultParams}>
    {({ setParams, params }) =>
      <Component {...props} setParams={setParams} params={params} />}
  </ParamsWrapper>
})

export default withParams
