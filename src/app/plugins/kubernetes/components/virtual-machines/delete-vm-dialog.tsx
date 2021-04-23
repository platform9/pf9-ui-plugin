import React, { useCallback } from 'react'
import useReactRouter from 'use-react-router'
import Text from 'core/elements/text'
import { Dialog, DialogContent, DialogActions, Button, DialogTitle } from '@material-ui/core'
import Progress from 'core/components/progress/Progress'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { trackEvent } from 'utils/tracking'
import { virtualMachineActions } from './actions'
import { routes } from 'core/utils/routes'

const stopPropagation = (e) => e.stopPropagation()
const VirtualMachineDeleteDialog = ({ rows: [virtualMachine], onClose }) => {
  const { history } = useReactRouter()
  const [deleteVirtualMachine, deletingVirtualMachine] = useDataUpdater(
    virtualMachineActions.delete,
    (success) => {
      trackEvent('Delete VM', {
        cluster_uuid: virtualMachine?.clusterId,
        vm_name: virtualMachine?.name,
        vm_namespace: virtualMachine?.namespace,
      })
    },
  )
  const title = `Permanently delete VM "${virtualMachine?.name}"?`
  const handleDelete = useCallback(async () => {
    await deleteVirtualMachine(virtualMachine)
    onClose()
    history.push(routes.virtualMachines.list.path())
  }, [virtualMachine])

  return (
    <Dialog open onClose={onClose} onClick={stopPropagation}>
      <DialogTitle>
        <Text variant="subtitle1">{title}</Text>
      </DialogTitle>
      <Progress loading={deletingVirtualMachine} renderContentOnMount maxHeight={60}>
        <DialogContent>
          <Text variant="body1" component="div">
            Please confirm you want to delete this VM. This action cannot be undone.
          </Text>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Don't Delete
          </Button>
          <Button variant="contained" color="primary" onClick={handleDelete}>
            Delete this VM
          </Button>
        </DialogActions>
      </Progress>
    </Dialog>
  )
}

export default VirtualMachineDeleteDialog
