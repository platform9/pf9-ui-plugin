import React from 'react'
import { withRouter } from 'react-router-dom'
import AddVolumeForm from './AddVolumeForm'
import { ADD_VOLUME, GET_VOLUMES } from './actions'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddVolumePage extends React.Component {
  handleSubmit = volume => {
    const { client, history } = this.props
    try {
      client.mutate({
        mutation: ADD_VOLUME,
        variables: {
          input: volume
        },
        update: (proxy, { data: { createVolume } }) => {
          const data = proxy.readQuery({ query: GET_VOLUMES })
          data.volumes.push(createVolume)
          proxy.writeQuery({ query: GET_VOLUMES, data })
        }
      })
      history.push('/ui/openstack/volumes')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <div>
        <h1>Add volume</h1>
        <AddVolumeForm onSubmit={this.handleSubmit} />
      </div>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo,
)(AddVolumePage)
