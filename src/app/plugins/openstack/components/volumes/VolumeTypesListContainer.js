/* eslint-disable camelcase */
import React from 'react'
import PropTypes from 'prop-types'
import CRUDListContainer from 'core/common/CRUDListContainer'
import VolumeTypesList from './VolumeTypesList'
import { GET_VOLUME_TYPES, REMOVE_VOLUME_TYPE } from './actions'
import { parseJSON } from 'util/misc'

// Promote `volume_backend_name` from `extra_specs` into its own field
// This is a rather tedious pattern.  If we are doing it elsewhere we
// should probably create some utility function for it.
const convertVolumeType = x => {
  let cloned = { ...x }
  const { volume_backend_name, ...others } = parseJSON(x && x.extra_specs)
  cloned.extra_specs = JSON.stringify(others)
  cloned.volume_backend_name = volume_backend_name
  return cloned
}

class VolumeTypesListContainer extends React.Component {
  render () {
    const volumeTypes = (this.props.volumeTypes || []).map(convertVolumeType)
    return (
      <CRUDListContainer
        items={volumeTypes}
        objType="volumeTypes"
        getQuery={GET_VOLUME_TYPES}
        removeQuery={REMOVE_VOLUME_TYPE}
        addUrl="/ui/openstack/storage/volumeTypes/add"
        editUrl="/ui/openstack/storage/volumeTypes/edit"
      >
        {({ onDelete, onAdd, onEdit }) => (
          <VolumeTypesList
            volumeTypes={volumeTypes}
            onAdd={onAdd}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        )}
      </CRUDListContainer>
    )
  }
}

VolumeTypesListContainer.propTypes = {
  volumeTypes: PropTypes.arrayOf(PropTypes.object)
}

export default VolumeTypesListContainer
