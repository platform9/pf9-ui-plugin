import React from 'react'
import { compose, keyValueArrToObj } from 'app/utils/fp'
import { withAppContext } from 'core/AppContext'
import FormWrapper from 'core/components/FormWrapper'
import { withRouter } from 'react-router-dom'
import requiresAuthentication from '../../util/requiresAuthentication'
import { loadVolumeTypes } from './actions'
import AddVolumeTypeForm from './AddVolumeTypeForm'

class AddVolumeTypePage extends React.Component {
  handleAdd = async data => {
    const { setContext, context, history } = this.props
    try {
      const volumeType = {
        name: data.name,
        extra_specs: keyValueArrToObj(data.metadata),
      }
      const createdVolumeType = await context.apiClient.cinder.createVolumeType(volumeType)
      const existingVolumeTypes = await loadVolumeTypes({ setContext, context })
      setContext({ volumeTypes: [ ...existingVolumeTypes, createdVolumeType ] })
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
