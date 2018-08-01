import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import AddVolumeForm from './AddVolumeForm'
import { withRouter } from 'react-router-dom'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'
import { ADD_VOLUME, GET_VOLUMES } from './actions'

class AddVolumePage extends React.Component {
  handleAdd = (input) => {
    const { client, history } = this.props
    try {
      client.mutate({
        mutation: ADD_VOLUME,
        variables: {
          input: input
        },
        update: (proxy, { data }) => {
          const tempData = proxy.readQuery({ query: GET_VOLUMES })
          tempData['volumes'].push(data['createVolume'])
          proxy.writeQuery({ query: GET_VOLUMES, data: tempData })
        }
      })
      history.push('/ui/openstack/storage#volumes')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <FormWrapper title="Add Volume" backUrl="/ui/openstack/storage#volumes">
        <AddVolumeForm onComplete={this.handleAdd} />
      </FormWrapper>
    )
  }
}

export default compose(
  withRouter,
  withApollo,
  requiresAuthentication
)(AddVolumePage)
