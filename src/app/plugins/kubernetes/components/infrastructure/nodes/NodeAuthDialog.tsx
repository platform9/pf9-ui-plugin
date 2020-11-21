import React, { useCallback } from 'react'
import useDataUpdater from 'core/hooks/useDataUpdater'
import ConfirmationDialog from 'core/components/ConfirmationDialog'
import { authNode } from './actions'

const NodeAuthDialog = ({ rows: [node], onClose }) => {
  const [authorize] = useDataUpdater(authNode, onClose)
  const handleSubmit = useCallback(() => authorize(node), [authNode])

  return (
    <ConfirmationDialog
      title="Authorize node"
      text={
        <>
          You are about to authorize the node {node?.name}
          <br />
          Are you sure?
        </>
      }
      open
      onCancel={onClose}
      onConfirm={handleSubmit}
    />
  )
}

export default NodeAuthDialog
