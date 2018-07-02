import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import AddVolumeForm from './AddVolumeForm'
import requiresAuthentication from '../../util/requiresAuthentication'

class AddVolumePage extends React.Component {
  render () {
    return (
      <FormWrapper title="Add Volume" backUrl="/ui/openstack/volumes">
        <AddVolumeForm />
      </FormWrapper>
    )
  }
}

export default requiresAuthentication(AddVolumePage)
