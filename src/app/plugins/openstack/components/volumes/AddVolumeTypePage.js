import React from 'react'
import requiresAuthentication from '../../util/requiresAuthentication'
import FormWrapper from 'core/common/FormWrapper'
import AddVolumeTypeForm from './AddVolumeTypeForm'
import { withRouter } from 'react-router-dom'
import { compose, keyValueArrToObj } from 'core/fp'
import { withAppContext } from 'core/AppContext'
import { loadVolumeTypes } from './actions'

class AddVolumeTypePage extends React.Component {
  handleAdd = async data => {
    const { setContext, context, history } = this.props
    try {
      const volumeType = {
        name: data.name,
        extra_specs: keyValueArrToObj(data.metadata),
      }
      const createdVolumeType = await context.openstackClient.cinder.createVolumeType(volumeType)
      const existingVolumeTypes = await loadVolumeTypes({ setContext, context })
      setContext({ volumes: [ ...existingVolumeTypes, createdVolumeType ] })
      history.push('/ui/openstack/storage#volumeTypes')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <FormWrapper title="Add Volume Type" backUrl="/ui/openstack/storage#volumeTypes">
        <AddVolumeTypeForm onComplete={this.handleAdd} />
      </FormWrapper>
    )
  }
}

export default compose(
  withAppContext,
  withRouter,
  requiresAuthentication
)(AddVolumeTypePage)
