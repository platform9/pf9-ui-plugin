import React from 'react'
import { connect } from 'react-redux'
import requiresAuthentication from '../../openstack/util/requiresAuthentication'

function mapStateToProps (state, ownProps) {
  return {}
}

@requiresAuthentication
@connect(mapStateToProps)
class Dashboard extends React.Component {
  render () {
    return (
      <div className="dashboard-page">
        <h1>This is the kubernetes dashboard page</h1>
      </div>
    )
  }
}

export default Dashboard
