import React from 'react'
import requiresAuthentication from '../util/requiresAuthentication'
import { connect } from 'react-redux'
import { fetchFlavors } from '../actions/flavors'

import Loader from 'core/common/Loader'
import FlavorsListContainer from './flavors/FlavorsListContainer'

function mapStateToProps (state, ownProps) {
  const { flavors } = state.openstack
  return {
    flavorsLoaded: flavors.flavorsLoaded,
  }
}

@requiresAuthentication
@connect(mapStateToProps)
class FlavorsPage extends React.Component {
  componentDidMount () {
    // Load the flavors if they don't already exist
    if (!this.props.flavorsLoaded) {
      this.props.dispatch(fetchFlavors())
    }
  }
  render () {
    const { flavorsLoaded } = this.props
    return (
      <div>
        <h1>Flavors Page</h1>
        {!flavorsLoaded && <Loader />}
        {flavorsLoaded && <FlavorsListContainer />}
      </div>
    )
  }
}

export default FlavorsPage
