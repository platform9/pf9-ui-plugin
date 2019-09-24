import React from 'react'
import ApiClient from 'api-client/ApiClient'
import { withRouter } from 'react-router-dom'
import { compose, keyValueArrToObj, range } from 'app/utils/fp'
import { withAppContext } from 'core/AppProvider'
import FormWrapper from 'core/components/FormWrapper'
import { loadVolumes } from './actions'
import AddVolumeForm from './AddVolumeForm'
import { dataCacheKey } from 'core/helpers/createContextLoader'
import { assocPath } from 'ramda'
import { mapAsync } from 'utils/async'

const constructBatch = (numVolumes, prefix, data) =>
  range(1, numVolumes)
    .map(i => `${prefix || data.name}${i}`)
    .map(name => ({ ...data, name }))
    .map(volume => ({
      ...volume,
      metadata: keyValueArrToObj(volume.metadata),
    }))

const { cinder } = ApiClient.getInstance()

class AddVolumePage extends React.PureComponent {
  handleAdd = async volume => {
    const { setContext, getContext, history } = this.props
    try {
      const { numVolumes, volumeNamePrefix, ...rest } = volume
      const volumesToCreate = constructBatch(numVolumes, volumeNamePrefix, rest)
      const existing = await loadVolumes({ setContext, getContext })
      // TODO: use createContextUpdater
      const createdVolumes = await mapAsync(
        data => cinder.createVolume(data),
        volumesToCreate,
      )
      setContext(assocPath([dataCacheKey, 'volumes'], [...existing, ...createdVolumes]))
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
)(AddVolumePage)
