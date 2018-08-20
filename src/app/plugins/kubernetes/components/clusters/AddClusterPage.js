import React from 'react'
import { withRouter } from 'react-router-dom'
import AddClusterForm from './AddClusterForm'
import { compose } from 'core/fp'
import requiresAuthentication from 'openstack/util/requiresAuthentication'

class AddClusterPage extends React.Component {
  handleSubmit = cluster => {
    try {
      // TODO: add the cluster
      history.push('/ui/openstack/clusters')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <div>
        <h1>Add Cluster Page</h1>
        <AddClusterForm onSubmit={this.handleSubmit} />
      </div>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
)(AddClusterPage)
