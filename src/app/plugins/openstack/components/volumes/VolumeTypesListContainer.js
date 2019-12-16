/* eslint-disable camelcase */
import React from 'react'
import PropTypes from 'prop-types'
import { keyValueArrToObj } from 'app/utils/fp'
import CRUDListContainer from 'core/components/CRUDListContainer'
import createListTableComponent from 'core/helpers/createListTableComponent'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { volumeTypeActions } from 'openstack/components/volumes/actions'

// Promote `volume_backend_name` from `extra_specs` into its own field
// This is a rather tedious pattern.  If we are doing it elsewhere we
// should probably create some utility function for it.
const convertVolumeType = x => {
  const cloned = { ...x }
  const backendNameItem = x.extra_specs.find(x => x.key === 'volume_backend_name')
  cloned.volume_backend_name = (backendNameItem && backendNameItem.value) || ''
  cloned.extra_specs = x.extra_specs.filter(x => x.key !== 'volume_backend_name')
  return cloned
}
const columns = [
  { id: 'name', label: 'Name' },
  { id: 'description', label: 'Description' },
  { id: 'is_public', label: 'Public?' },
  { id: 'volume_backend_name', label: 'Volume Backend' },
  { id: 'extra_specs', label: 'Metadata', render: data => JSON.stringify(keyValueArrToObj(data)) },
]

export const VolumeTypesList = createListTableComponent({
  title: 'Volume Types',
  emptyText: 'No volume types found.',
  name: 'VolumeTypesList',
  columns,
})

const VolumeTypesListContainer = ({ volumeTypes = [] }) => {
  const [remove, removing] = useDataUpdater(volumeTypeActions.delete)
  const handleRemove = async id => {
    remove({ id })
  }
  const convertedVolumeTypes = volumeTypes.map(convertVolumeType)
  return (
    <CRUDListContainer
      items={convertedVolumeTypes}
      onRemove={handleRemove}
      addUrl="/ui/openstack/storage/volumeTypes/add"
      editUrl="/ui/openstack/storage/volumeTypes/edit"
    >
      {handlers => <VolumeTypesList loading={removing} data={convertedVolumeTypes} {...handlers} />}
    </CRUDListContainer>
  )
}

VolumeTypesListContainer.propTypes = {
  volumeTypes: PropTypes.arrayOf(PropTypes.object)
}

export default VolumeTypesListContainer
