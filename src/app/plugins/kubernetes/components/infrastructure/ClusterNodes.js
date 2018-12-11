import React from 'react'
import { withRouter } from 'react-router'
import { withAppContext } from 'core/AppContext'
import { compose, pluck } from 'ramda'
import { loadInfrastructure } from './actions'
import { withDataLoader } from 'core/DataLoader'
import ListTable, { pluckVisibleColumnIds } from 'core/common/list_table/ListTable'

// This table essentially has the same functionality as the <NodesList>
// except that it is only the nodes from the a single cluster.
import { columns } from './NodesListPage'
import { withScopedPreferences } from 'core/helpers/PreferencesProvider'

const ClusterNodes = ({ context, data, match }) => {
  const {
    preferences: { visibleColumns, columnsOrder, rowsPerPage },
    updatePreferences
  } = this.props
  const cluster = data.find(x => x.uuid === match.params.id)
  const nodes = cluster.nodes.map(node => context.nodes.find(x => x.uuid === node.uuid))
  return (
    <div>
      <ListTable
        title="Cluster Nodes"
        columns={columns}
        data={nodes}
        uniqueIdentifier="uuid"
        visibleColumns={visibleColumns}
        columnsOrder={columnsOrder}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={rowsPerPage => updatePreferences({ rowsPerPage })}
        onColumnsChange={updatedColumns => updatePreferences({
          visibleColumns: pluckVisibleColumnIds(updatedColumns),
          columnsOrder: pluck('id', updatedColumns)
        })}
      />
    </div>
  )
}

export default compose(
  withRouter,
  withAppContext,
  withScopedPreferences('ClusterNodes'),
  withDataLoader({ dataKey: 'clusters', loaderFn: loadInfrastructure }),
)(ClusterNodes)
