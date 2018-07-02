import React from 'react'
import { withRouter } from 'react-router-dom'
import FormWrapper from 'core/common/FormWrapper'
import AddVolumeForm from './AddVolumeForm'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddVolumePage extends React.Component {
  render () {
    return (
      <FormWrapper title="Add Volume" backUrl="/ui/openstack/volumes">
        <AddVolumeForm
          client={this.props.client}
          history={this.props.history}
        />
      </FormWrapper>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo,
)(AddVolumePage)
