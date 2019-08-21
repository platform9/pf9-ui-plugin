import React from 'react'
import ApiClient from 'api-client/ApiClient'
import { compose, keyValueArrToObj } from 'app/utils/fp'
import { withAppContext } from 'core/AppProvider'
import FormWrapper from 'core/components/FormWrapper'
import { withRouter } from 'react-router-dom'
import requiresAuthentication from '../../util/requiresAuthentication'
import { loadVolumeTypes } from './actions'
import AddVolumeTypeForm from './AddVolumeTypeForm'
import { dataContextKey } from 'core/helpers/createContextLoader'
import { assocPath } from 'ramda'

class AddVolumeTypePage extends React.Component {
  handleAdd = async data => {
    const { setContext, getContext, history } = this.props
    try {
      const volumeType = {
        name: data.name,
        extra_specs: keyValueArrToObj(data.metadata),
      }
      const existingVolumeTypes = await loadVolumeTypes({ setContext, getContext })
      // TODO: use createContextUpdater
      const createdVolumeType = await ApiClient.getInstance().cinder.createVolumeType(volumeType)
      setContext(assocPath([dataContextKey, 'volumeTypes'], [...existingVolumeTypes, createdVolumeType]))
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
