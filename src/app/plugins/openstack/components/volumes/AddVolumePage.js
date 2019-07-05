import React from 'react'
import { withRouter } from 'react-router-dom'
import { asyncMap, compose, keyValueArrToObj, range } from 'app/utils/fp'
import { withAppContext } from 'core/AppContext'
import FormWrapper from 'core/components/FormWrapper'
import requiresAuthentication from '../../util/requiresAuthentication'
import { loadVolumes } from './actions'
import AddVolumeForm from './AddVolumeForm'

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
      const createdVolumes = await asyncMap(volumesToCreate, data =>
        getContext().apiClient.cinder.createVolume(data)
      )
      setContext({ volumes: [ ...existing, ...createdVolumes ] })
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
