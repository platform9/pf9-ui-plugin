import React, { useCallback } from 'react'
import { deauthNode } from 'k8s/components/infrastructure/nodes/actions'
import useDataUpdater from 'core/hooks/useDataUpdater'
import ConfirmationDialog from 'core/components/ConfirmationDialog'
import Typography from '@material-ui/core/Typography'

const NodeDeauthDialog = ({ rows: [node], onClose }) => {
  const [deauth, updating] = useDataUpdater(nodeActions.deAuth, onClose)
  const handeSubmit = useCallback(() => deauth(node), [deauth])

  return (
    <ConfirmationDialog
      loading={updating}
      title="De-authorize node"
      text={<>
        <Typography variant="body1">
          You are about to de-authorize the node {node.name} ({node.primaryIp})</Typography><br />
        <Typography variant="body1">Are you sure?</Typography>
      </>}
      open
      onCancel={onClose}
      onConfirm={handeSubmit} />
  )
}

export default NodeDeauthDialog
