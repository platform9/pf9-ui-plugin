import React from 'react'
import { withRouter } from 'react-router-dom'
import FormWrapper from 'core/common/FormWrapper'
import AddRouterForm from './AddRouterForm'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddRouterPage extends React.Component {
  render () {
    return (
      <FormWrapper title="Add Router" backUrl="/ui/openstack/routers">
        <AddRouterForm
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
)(AddRouterPage)
