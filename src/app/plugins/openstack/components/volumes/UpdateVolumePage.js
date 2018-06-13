import React from 'react'
import { withRouter } from 'react-router-dom'
import UpdateVolumeForm from './UpdateVolumeForm'
import { GET_VOLUME, UPDATE_VOLUME } from './actions'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'

class UpdateVolumePage extends React.Component {
  componentDidMount () {
    const { client } = this.props
    const volumeId = this.props.match.params.volumeId

    client.query({
      query: GET_VOLUME,
      variables: {
        id: volumeId
      }
    }).then((response) => {
      const volume = response.data.volume
      if (volume) {
        this.setState({ volume })
      }
    })
  }

  handleSubmit = volume => {
    const { client, history } = this.props
    const volumeId = this.props.match.params.volumeId

    try {
      client.mutate({
        mutation: UPDATE_VOLUME,
        variables: {
          id: volumeId,
          input: volume
        }
      })
      history.push('/ui/openstack/volumes')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    const volume = this.state && this.state.volume

    return (
      <div>
        <h1>Update Volume</h1>
        { volume &&
          <UpdateVolumeForm onSubmit={this.handleSubmit} volume={volume} />
        }
      </div>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo
)(UpdateVolumePage)
