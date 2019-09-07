import React, { useCallback, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, Typography, Table, TableBody, DialogActions, Button, TableRow,
  TableCell, Checkbox,
} from '@material-ui/core'
import { clusterActions } from 'k8s/components/infrastructure/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { except } from 'utils/fp'
import Progress from 'core/components/progress/Progress'
import { repositoryActions } from 'k8s/components/apps/actions'
import { pluck } from 'ramda'
import useDataUpdater from 'core/hooks/useDataUpdater'

// The modal is technically inside the row, so clicking anything inside
// the modal window will cause the table row to be toggled.
const stopPropagation = e => {
  // Except for <a href=""> style links
  if (e.target.tagName.toUpperCase() === 'A') { return }
  e.preventDefault()
  e.stopPropagation()
}

export default ({ onClose, row: repository }) => {
  const [clusters, loadingClusters] = useDataLoader(clusterActions.list)
  const [update, updating] = useDataUpdater(repositoryActions.updateRepoClusters, onClose)
  const [selectedRows, updateSelectedRows] = useState(pluck('clusterId', repository.clusters))
  const toggleRow = useCallback(uuid => () => {
    updateSelectedRows(selectedRows.includes(uuid)
      ? except(uuid, selectedRows)
      : [...selectedRows, uuid],
    )
  }, [selectedRows])
  const handleSubmit = async () => {
    update({ id: repository.id, clusters: selectedRows })
  }

  const renderClusterRow = ({ uuid, name }) => {
    return (
      <TableRow key={uuid}>
        <TableCell padding="checkbox">
          <Checkbox checked={selectedRows.includes(uuid)} onClick={toggleRow(uuid)} color="primary" />
        </TableCell>
        <TableCell>{name}</TableCell>
      </TableRow>
    )
  }
  return (
    <Dialog open onClose={onClose} onClick={stopPropagation}>
      <DialogTitle>Edit Cluster Access for {repository.name}</DialogTitle>
      <Progress loading={loadingClusters || updating} inline>
        <DialogContent>
          <p>
            Select the clusters to add this repository to:
          </p>
          {clusters.length === 0 &&
          <Typography variant="h5">No clusters available to add</Typography>
          }
          <Table>
            <TableBody>
              {clusters.map(renderClusterRow)}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" autoFocus>
            Update
          </Button>
        </DialogActions>
      </Progress>
    </Dialog>
  )
}
