import React from 'react'
import PropTypes from 'prop-types'
import { keyValueArrToObj } from 'core/fp'

import ListTable, { pluckVisibleColumnIds } from 'core/common/list_table/ListTable'
import { compose, pluck } from 'ramda'
import { withScopedPreferences } from 'core/helpers/PreferencesProvider'

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'description', label: 'Description' },
  { id: 'is_public', label: 'Public?' },
  { id: 'volume_backend_name', label: 'Volume Backend' },
  { id: 'extra_specs', label: 'Metadata', render: data => JSON.stringify(keyValueArrToObj(data)) },
]

const VolumeTypesList = ({
  onAdd, onDelete, onEdit, volumeTypes,
  preferences: { visibleColumns, columnsOrder, rowsPerPage },
  updatePreferences
}) => (
  !volumeTypes || volumeTypes.length === 0
    ? <h1>No volume types found.</h1>
    : <ListTable
      title="Volume Types"
      columns={columns}
      data={volumeTypes}
      onAdd={onAdd}
      onDelete={onDelete}
      onEdit={onEdit}
      searchTarget="name"
      visibleColumns={visibleColumns}
      columnsOrder={columnsOrder}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={rowsPerPage => updatePreferences({ rowsPerPage })}
      onColumnsChange={updatedColumns => updatePreferences({
        visibleColumns: pluckVisibleColumnIds(updatedColumns),
        columnsOrder: pluck('id', updatedColumns)
      })}
    />
)

VolumeTypesList.propTypes = {
  /** List of volumeTypes [{ id, name... }] */
  volumeTypes: PropTypes.array.isRequired,

  /** What to do when the add button is clicked */
  onAdd: PropTypes.func.isRequired,

  /** Called onClick of delete icon for a volume row */
  onDelete: PropTypes.func.isRequired,

  onEdit: PropTypes.func.isRequired,
}

VolumeTypesList.defaultProps = {
  volumeTypes: [],
}

export default compose(
  withScopedPreferences('VolumeTypesList')
)(VolumeTypesList)
