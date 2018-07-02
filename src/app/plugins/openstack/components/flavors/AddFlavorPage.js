import React from 'react'
import { withRouter } from 'react-router-dom'
import FormWrapper from 'core/common/FormWrapper'
import AddFlavorForm from './AddFlavorForm'

import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddFlavorPage extends React.Component {
  render () {
    return (
      <FormWrapper title="Add Flavor" backUrl="/ui/openstack/flavors">
        <AddFlavorForm
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
)(AddFlavorPage)
