import React, { useState, useCallback } from 'react'
import ExternalLink from 'core/components/ExternalLink'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core'
import { loadNodes, updateRemoteSupport } from 'k8s/components/infrastructure/nodes/actions'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Checkbox from 'core/components/validatedForm/CheckboxField'
import Progress from 'core/components/progress/Progress'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useDataLoader from 'core/hooks/useDataLoader'

// The modal is technically inside the row, so clicking anything inside
// the modal window will cause the table row to be toggled.
const stopPropagation = e => e.stopPropagation()

const RemoteSupportDialog = ({ rows: [node], onClose }) => {
  const reloadNodesAndClose = async () => {
    await reloadNodes(true)
    onClose()
  }

  const [updateNode, updatingNode] = useDataUpdater(updateRemoteSupport, reloadNodesAndClose)
  const [nodes, loadingNodes, reloadNodes] = useDataLoader(loadNodes)
  const [enableSupport, setEnableSupport] = useState(node.combined.supportRole)
  
  const handleSubmit = useCallback(async ({ enableSupport }) => {
    console.log(enableSupport)
    // If no change, just close the modal
    if (enableSupport === node.combined.supportRole) { return onClose() }
    await updateNode({ id: node.uuid, enableSupport })
  }, [node])
  
  const initialValues = { enableSupport }
  return (
    <Dialog open onClose={onClose} onClick={stopPropagation}>
      <DialogTitle>Configure Advanced Remote Support</DialogTitle>
      <ValidatedForm initialValues={initialValues} fullWidth onSubmit={handleSubmit}>
        <Progress loading={updatingNode} renderContentOnMount maxHeight={60}>
          <DialogContent>
            <p>
              You may enable or disable Advanced Remote Support on this node. Please refer to the
              following <ExternalLink url="https://docs.platform9.com/support/enabling-remote-ssh-on-linux-hosts-managed-by-platform9-host-agent/">
              article</ExternalLink> for more information.
            </p>
            <Checkbox id="enableSupport" onChange={() => setEnableSupport(!enableSupport)} label="Enable Advanced Remote Support" />
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Update Node
            </Button>
          </DialogActions>
        </Progress>
      </ValidatedForm>
    </Dialog>
  )
}

export default RemoteSupportDialog
