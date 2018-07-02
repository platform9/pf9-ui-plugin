import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import AddFlavorForm from './AddFlavorForm'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddFlavorPage extends React.Component {
  render () {
    return (
      <FormWrapper title="Add Flavor" backUrl="/ui/openstack/flavors">
        <AddFlavorForm />
      </FormWrapper>
    )
  }
}

export default requiresAuthentication(AddFlavorPage)
