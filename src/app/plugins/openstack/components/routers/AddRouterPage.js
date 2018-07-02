import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import AddRouterForm from './AddRouterForm'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddRouterPage extends React.Component {
  render () {
    return (
      <FormWrapper title="Add Router" backUrl="/ui/openstack/routers">
        <AddRouterForm />
      </FormWrapper>
    )
  }
}

export default requiresAuthentication(AddRouterPage)
