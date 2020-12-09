import React, { useCallback, useState } from 'react'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import useDataUpdater from 'core/hooks/useDataUpdater'
import ConfirmationDialog from 'core/components/ConfirmationDialog'
import Text from 'core/elements/text'
import { FormControlLabel, Radio, RadioGroup } from '@material-ui/core'

enum UpgradeTypes {
  Minor = 'minor',
  Patch = 'patch',
}

function getUpgradeTarget(cluster) {
  if ((cluster.canMinorUpgrade && cluster.canPatchUpgrade) || cluster.canMinorUpgrade) {
    return UpgradeTypes.Minor
  }
  return UpgradeTypes.Patch
}

const ClusterUpgradeDialog = ({ rows: [cluster], onClose }) => {
  const defaultState = getUpgradeTarget(cluster)
  const [upgradeType, setUpgradeType] = useState(defaultState)
  // @ts-ignore
  const [upgradeCluster, upgradingCluster] = useDataUpdater(clusterActions.upgradeCluster, onClose)
  const handeSubmit = useCallback(() => upgradeCluster({ cluster, upgradeType }), [
    upgradeCluster,
    upgradeType,
  ])

  const handleChange = useCallback(
    (event, upgradeChoice) => {
      setUpgradeType(upgradeChoice)
    },
    [upgradeType],
  )
  return (
    <ConfirmationDialog
      loading={upgradingCluster}
      title={`Upgrade Cluster "${cluster.name}"?`}
      text={
        <>
          <Text variant="body1">
            You are about to perform a {upgradeType} upgrade on your cluster.
            <br />
            <Text variant="caption1" component="span">
              <i>
                from <b>{cluster.kubeRoleVersion}</b> to{' '}
                <b>{cluster[`${upgradeType}UpgradeRoleVersion`]}</b>
              </i>
            </Text>
            <br /> Would you like to continue?
            <br />
          </Text>
          {cluster.canMinorUpgrade && cluster.canPatchUpgrade ? (
            <UpgradeTargetChoice
              upgradeType={upgradeType}
              cluster={cluster}
              onChange={handleChange}
            />
          ) : null}
        </>
      }
      open
      onCancel={onClose}
      onConfirm={handeSubmit}
    />
  )
}

function UpgradeTargetChoice({ upgradeType, cluster, onChange }) {
  return (
    <>
      <RadioGroup name="Upgrade Type" value={upgradeType} onChange={onChange}>
        <FormControlLabel
          value={UpgradeTypes.Minor}
          control={<Radio color="primary" />}
          label={`Minor - ${cluster.minorUpgradeRoleVersion}`}
        />
        <FormControlLabel
          value={UpgradeTypes.Patch}
          control={<Radio color="primary" />}
          label={`Patch - ${cluster.patchUpgradeRoleVersion}`}
        />
      </RadioGroup>
    </>
  )
}

export default ClusterUpgradeDialog
