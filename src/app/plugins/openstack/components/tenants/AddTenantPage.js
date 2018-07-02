import React from 'react'
import { withRouter } from 'react-router-dom'
import FormWrapper from 'core/common/FormWrapper'
import AddTenantForm from './AddTenantForm'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddTenantPage extends React.Component {
  render () {
    return (
      <FormWrapper title="Add Tenant" backUrl="/ui/openstack/tenants">
        <AddTenantForm
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
)(AddTenantPage)
