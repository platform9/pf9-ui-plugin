import React from 'react'
import requiresAuthentication from '../util/requiresAuthentication'
import { connect } from 'react-redux'
import { fetchNetworks } from '../actions/networks'

import Loader from 'core/common/Loader'
import NetworksListContainer from './networks/NetworksListContainer'

function mapStateToProps (state, ownProps) {
  const { networks } = state.openstack
  return {
    networksLoaded: networks.networksLoaded,
  }
}

@requiresAuthentication
@connect(mapStateToProps)
class NetworksPage extends React.Component {
  componentDidMount () {
    // Load the networks if they don't already exist
    if (!this.props.networksLoaded) {
      this.props.dispatch(fetchNetworks())
    }
  }
  render () {
    const { networksLoaded } = this.props
    return (
      <div>
        <h1>Networks Page</h1>
        {!networksLoaded && <Loader />}
        {networksLoaded && <NetworksListContainer />}
      </div>
    )
  }
}

export default NetworksPage
