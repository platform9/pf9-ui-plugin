import React, { useCallback } from 'react'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import useDataUpdater from 'core/hooks/useDataUpdater'
import ConfirmationDialog from 'core/components/ConfirmationDialog'
import Typography from '@material-ui/core/Typography'

const ClusterUpgradeDialog = ({ rows: [cluster], onClose }) => {
  const [upgradeCluster, upgradingCluster] = useDataUpdater(clusterActions.upgradeCluster, onClose)
  const handeSubmit = useCallback(() => upgradeCluster(cluster), [upgradeCluster])

  return (
    <ConfirmationDialog
      loading={upgradingCluster}
      title="Upgrade Cluster"
      text={<>
        <Typography variant="body1">
          You are about to upgrade the cluster named {cluster.name}</Typography><br />
        <Typography variant="body1">Are you sure?</Typography>
      </>}
      open
      onCancel={onClose}
      onConfirm={handeSubmit} />
  )
}

export default ClusterUpgradeDialog
