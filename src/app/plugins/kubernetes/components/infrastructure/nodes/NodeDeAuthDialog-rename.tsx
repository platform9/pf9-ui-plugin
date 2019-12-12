import React, { useCallback } from 'react'
import { deAuthNode } from 'k8s/components/infrastructure/nodes/actions'
import useDataUpdater from 'core/hooks/useDataUpdater'
import ConfirmationDialog from 'core/components/ConfirmationDialog'

const NodeDeAuthDialog = ({ rows: [node], onClose }) => {
  const [deauth] = useDataUpdater(deAuthNode, onClose)
  const handeSubmit = useCallback(() => deauth(node), [deauth])

  return (
    <ConfirmationDialog
      title="De-authorize node"
      text={<>
          You are about to de-authorize the node {node.name} ({node.primaryIp})
        <br />
        Are you sure?
      </>}
      open
      onCancel={onClose}
      onConfirm={handeSubmit} />
  )
}

export default NodeDeAuthDialog
