import React from 'react'
import { keyValueArrToObj, range } from 'app/utils/fp'
import FormWrapper from 'core/components/FormWrapper'
import AddVolumeForm from './AddVolumeForm'
import useReactRouter from 'use-react-router'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { volumeActions } from 'openstack/components/volumes/actions'

const constructBatch = (numVolumes, prefix, data) =>
  range(1, numVolumes)
    .map(i => `${prefix || data.name}${i}`)
    .map(name => ({ ...data, name }))
    .map(volume => ({
      ...volume,
      metadata: keyValueArrToObj(volume.metadata),
    }))

const AddVolumePage = () => {
  const { history } = useReactRouter()
  const [create, creating] = useDataUpdater(volumeActions.create)

  const handleAdd = async volume => {
    const { numVolumes, volumeNamePrefix, ...rest } = volume
    const volumesToCreate = constructBatch(numVolumes, volumeNamePrefix, rest)
    await Promise.all(volumesToCreate.map(create))
    history.push('/ui/openstack/storage#volumes')
  }

  return (
    <FormWrapper loading={creating} title="Add Volume" backUrl="/ui/openstack/storage#volumes">
      <AddVolumeForm onComplete={handleAdd} />
    </FormWrapper>
  )
}

export default AddVolumePage
