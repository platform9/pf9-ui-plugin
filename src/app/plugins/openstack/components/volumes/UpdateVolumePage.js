import React from 'react'
import { withRouter } from 'react-router-dom'
import FormWrapper from 'core/common/FormWrapper'
import UpdateVolumeForm from './UpdateVolumeForm'
import { GET_VOLUME } from './actions'
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

  render () {
    const volume = this.state && this.state.volume

    return (
      <FormWrapper title="Update Volume" backUrl="/ui/openstack/volumes">
        { volume &&
          <UpdateVolumeForm
            volume={volume}
            client={this.props.client}
            history={this.props.history}
            workId={this.props.match.params.volumeId}
          />
        }
      </FormWrapper>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo
)(UpdateVolumePage)
