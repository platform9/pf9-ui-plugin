import React from 'react'
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
            objId={this.props.match.params.volumeId}
          />
        }
      </FormWrapper>
    )
  }
}

export default compose(
  requiresAuthentication,
  withApollo
)(UpdateVolumePage)
