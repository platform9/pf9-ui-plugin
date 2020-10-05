import React, { useCallback } from 'react'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import useDataUpdater from 'core/hooks/useDataUpdater'
import ConfirmationDialog from 'core/components/ConfirmationDialog'
import Text from 'core/elements/text'

const ClusterUpgradeDialog = ({ rows: [cluster], onClose }) => {
  const [upgradeCluster, upgradingCluster] = useDataUpdater(clusterActions.upgradeCluster, onClose)
  const handeSubmit = useCallback(() => upgradeCluster(cluster), [upgradeCluster])

  return (
    <ConfirmationDialog
      loading={upgradingCluster}
      title="Upgrade Cluster"
      text={
        <>
          <Text variant="body1">You are about to upgrade the cluster named {cluster.name}</Text>
          <br />
          <Text variant="body1">Are you sure?</Text>
        </>
      }
      open
      onCancel={onClose}
      onConfirm={handeSubmit}
    />
  )
}

export default ClusterUpgradeDialog
