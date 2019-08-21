import React from 'react'
import ApiClient from 'api-client/ApiClient'
import { withRouter } from 'react-router-dom'
import { asyncMap, compose, keyValueArrToObj, range } from 'app/utils/fp'
import { withAppContext } from 'core/AppProvider'
import FormWrapper from 'core/components/FormWrapper'
import requiresAuthentication from '../../util/requiresAuthentication'
import { loadVolumes } from './actions'
import AddVolumeForm from './AddVolumeForm'
import { dataContextKey } from 'core/helpers/createContextLoader'
import { assocPath } from 'ramda'

const constructBatch = (numVolumes, prefix, data) =>
  range(1, numVolumes)
    .map(i => `${prefix || data.name}${i}`)
    .map(name => ({ ...data, name }))
    .map(volume => ({
      ...volume,
      metadata: keyValueArrToObj(volume.metadata)
    }))

class AddVolumePage extends React.Component {
  handleAdd = async volume => {
    const { setContext, getContext, history } = this.props
    try {
      const { numVolumes, volumeNamePrefix, ...rest } = volume
      const volumesToCreate = constructBatch(numVolumes, volumeNamePrefix, rest)
      const existing = await loadVolumes({ setContext, getContext })
      // TODO: use createContextUpdater
      const createdVolumes = await asyncMap(volumesToCreate, data =>
        ApiClient.getInstance().cinder.createVolume(data)
      )
      setContext(assocPath([dataContextKey, 'volumes'], [...existing, ...createdVolumes]))
      history.push('/ui/openstack/storage#volumes')
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return (
      <FormWrapper title="Add Volume" backUrl="/ui/openstack/storage#volumes">
        <AddVolumeForm onComplete={this.handleAdd} />
      </FormWrapper>
    )
  }
}

export default compose(
  withAppContext,
  withRouter,
  requiresAuthentication
)(AddVolumePage)
