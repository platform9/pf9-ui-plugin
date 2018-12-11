import React from 'react'
import PropTypes from 'prop-types'

import ListTable, { pluckVisibleColumnIds } from 'core/common/list_table/ListTable'
import { compose, pluck } from 'ramda'
import { withScopedPreferences } from 'core/helpers/PreferencesProvider'

const columns = [
  { id: 'name', label: 'Name' },
  { id: 'status', label: 'Status' },
  { id: 'state', label: 'State' }
]

class InstancesList extends React.Component {
  render () {
    const { onAdd, onDelete, onEdit, instances,
      preferences: { visibleColumns, columnsOrder, rowsPerPage },
      updatePreferences } = this.props
    if (!instances || instances.length === 0) {
      return <h1>No instances found.</h1>
    }
    return (
      <ListTable
        title="Instances"
        columns={columns}
        data={instances}
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
  }
}

InstancesList.propTypes = {
  /** List of instances [{ id, name... }] */
  instances: PropTypes.array.isRequired,

  /** What to do when the add button is clicked */
  onAdd: PropTypes.func.isRequired,

  /** Called onClick of delete icon */
  onDelete: PropTypes.func.isRequired,

  onEdit: PropTypes.func.isRequired,
}

InstancesList.defaultProps = {
  instances: [],
}

export default compose(
  withScopedPreferences('InstancesList')
)(InstancesList)
