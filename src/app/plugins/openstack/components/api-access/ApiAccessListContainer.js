import React from 'react'
import PropTypes from 'prop-types'

import { withApollo } from 'react-apollo'
import ApiAccessList from './ApiAccessList'

class ApiAccessListContainer extends React.Component {
  render () {
    return (
      <ApiAccessList catalog={this.props.catalog} />
    )
  }
}

ApiAccessListContainer.propTypes = {
  catalog: PropTypes.arrayOf(PropTypes.object)
}
export default withApollo(ApiAccessListContainer)
