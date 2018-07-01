import React from 'react'
import { withRouter } from 'react-router-dom'
import FormWrapper from 'core/common/FormWrapper'
import AddNetworkForm from './AddNetworkForm'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddNetworkPage extends React.Component {
  render () {
    return (
      <FormWrapper title="Add Network" backUrl="/ui/openstack/networks">
        <AddNetworkForm
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
)(AddNetworkPage)
