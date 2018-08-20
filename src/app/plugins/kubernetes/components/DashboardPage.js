import React from 'react'
import { compose } from 'core/fp'
import requiresAuthentication from '../../openstack/util/requiresAuthentication'

class Dashboard extends React.Component {
  render () {
    return (
      <div className="dashboard-page">
        <h1>This is the kubernetes dashboard page</h1>
      </div>
    )
  }
}

export default compose(
  requiresAuthentication,
)(Dashboard)
