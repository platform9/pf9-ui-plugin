import React from 'react'
import { Query } from 'react-apollo'
import FormWrapper from 'core/common/FormWrapper'
import UpdateVolumeForm from './UpdateVolumeForm'
import { GET_VOLUME } from './actions'
import requiresAuthentication from '../../util/requiresAuthentication'

class UpdateVolumePage extends React.Component {
  render () {
    const id = this.props.match.params.volumeId

    return (
      <Query query={GET_VOLUME} variables={{ id }}>
        {({ data }) =>
          <FormWrapper title="Update Volume" backUrl="/ui/openstack/storage#volumes">
            { data && data.volume &&
              <UpdateVolumeForm
                volume={data.volume}
                objId={id}
              />
            }
          </FormWrapper>
        }
      </Query>
    )
  }
}

export default requiresAuthentication(UpdateVolumePage)
