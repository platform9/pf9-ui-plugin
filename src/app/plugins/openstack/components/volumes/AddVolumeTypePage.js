import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import AddVolumeTypeForm from './AddVolumeTypeForm'
import { withRouter } from 'react-router-dom'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'
import { ADD_VOLUME_TYPE, GET_VOLUME_TYPES } from './actions'

class AddVolumeTypePage extends React.Component {
  handleAdd = (input) => {
    const { client, history } = this.props
    try {
      client.mutate({
        mutation: ADD_VOLUME_TYPE,
        variables: {
          input: input
        },
        update: (proxy, { data }) => {
          const tempData = proxy.readQuery({ query: GET_VOLUME_TYPES })
          tempData.volumeTypes.push(data.createVolume)
          proxy.writeQuery({ query: GET_VOLUME_TYPES, data: tempData })
        }
      })
      history.push('/ui/openstack/storage#volumetypes')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <FormWrapper title="Add Volume Type" backUrl="/ui/openstack/storage#volumetypes">
        <AddVolumeTypeForm onComplete={this.handleAdd} />
      </FormWrapper>
    )
  }
}

export default compose(
  withRouter,
  withApollo,
  requiresAuthentication
)(AddVolumeTypePage)
