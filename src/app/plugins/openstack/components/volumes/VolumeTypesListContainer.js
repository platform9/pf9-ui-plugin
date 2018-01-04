/* eslint-disable camelcase */
import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/components/CRUDListContainer'
import { compose, keyValueArrToObj } from 'core/../../../../utils/fp'
import { withAppContext } from 'core/AppContext'
import createListTableComponent from 'core/helpers/createListTableComponent'

// Promote `volume_backend_name` from `extra_specs` into its own field
// This is a rather tedious pattern.  If we are doing it elsewhere we
// should probably create some utility function for it.
const convertVolumeType = x => {
  let cloned = { ...x }
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

class VolumeTypesListContainer extends React.Component {
  handleRemove = async id => {
    const { volumeTypes, setContext, context } = this.props
    const { cinder } = context.apiClient
    await cinder.deleteVolumeType(id)
    const newVolumeTypes = volumeTypes.filter(x => x.id !== id)
    setContext({ volumeTypes: newVolumeTypes })
  }

  render () {
    const volumeTypes = (this.props.volumeTypes || []).map(convertVolumeType)
    return (
      <CRUDListContainer
        items={volumeTypes}
        onRemove={this.handleRemove}
        addUrl="/ui/openstack/storage/volumeTypes/add"
        editUrl="/ui/openstack/storage/volumeTypes/edit"
      >
        {handlers => <VolumeTypesList data={volumeTypes} {...handlers} />}
      </CRUDListContainer>
    )
  }
}

VolumeTypesListContainer.propTypes = {
  volumeTypes: PropTypes.arrayOf(PropTypes.object)
}

export default compose(
  withAppContext,
)(VolumeTypesListContainer)
