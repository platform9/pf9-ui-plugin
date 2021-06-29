import React from 'react'
import Text from 'core/elements/text'
import { Button, Dialog, makeStyles, DialogActions, List, ListItem } from '@material-ui/core'
import Theme from 'core/themes/model'
import { partition } from 'ramda'

export const getNodeVersionToCompare = (cluster) => {
  return cluster.minorUpgradeRoleVersion
    ? cluster.minorUpgradeRoleVersion
    : cluster.patchUpgradeRoleVersion
}

export const filterInProgressUpgrade = (targetVersion) => (node) =>
  node.actualKubeRoleVersion === targetVersion

export const filterInInitialUpgrade = (targetVersion) => (node) =>
  node.actualKubeRoleVersion === targetVersion

const useStyles = makeStyles<Theme>((theme) => ({
  dialogContainer: {
    padding: theme.spacing(1, 3),
  },
  dialogContent: {
    display: 'grid',
    gridGap: '14px',
  },
  dialogHeader: {
    padding: theme.spacing(1, 0),
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
    fontWeight: 600,
  },
  nodeList: {
    display: 'grid',
    gridTemplateColumns: '50% 50%',
  },
  nodeNameTitle: {
    padding: theme.spacing(0.5),
    borderBottom: `1px solid ${theme.palette.grey[900]}`,
  },
  list: {
    maxHeight: '200px',
    overflow: 'auto',
  },
  listNodes: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
  },
}))

const ClusterBatchUpgradeDialog = ({
  wizardContext,
  handleClose,
  confirmBatchUpgrade,
  cluster,
}) => {
  const classes = useStyles({})
  const nodeVersionToCompare = getNodeVersionToCompare(cluster)

  // partion node list based upgradingTo flag ( in progress / intial )
  const [upgradedNodes, toBeUpgradedNodes] = partition(
    cluster.upgradingTo
      ? filterInProgressUpgrade(nodeVersionToCompare)
      : filterInInitialUpgrade(nodeVersionToCompare),
    cluster.workerNodes,
  )
  return (
    <Dialog open fullWidth maxWidth="md" onClose={handleClose}>
      <div className={classes.dialogContainer}>
        <Text variant="body1" className={classes.dialogHeader}>
          Warning: Partial Cluster Upgrade
        </Text>
        <div className={classes.dialogContent}>
          <Text variant="body2">
            The selected nodes will be upgraded in parallel, any worker nodes that are not included
            in this batch will need to be upgraded once the batch upgrade is complete.
          </Text>
          <Text variant="body2">Selected Nodes</Text>
          <div className={classes.nodeList}>
            <List className={classes.list}>
              <Text variant="body2" className={classes.nodeNameTitle}>
                Node Name
              </Text>
              {wizardContext.batchUpgradeNodes &&
                wizardContext.batchUpgradeNodes.map((node) => (
                  <ListItem key={node.uuid} className={classes.listNodes}>
                    {node.name}
                  </ListItem>
                ))}
            </List>
          </div>
          <Text variant="body2" className={classes.selectedNodesText}>
            Nodes Excluded from Upgrade: {toBeUpgradedNodes.length}
          </Text>
          <Text variant="body2" className={classes.selectedNodesText}>
            Nodes Already Upgraded: {upgradedNodes.length}
          </Text>
        </div>
        <DialogActions className={classes.dialogActions}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => confirmBatchUpgrade(wizardContext)}
          >
            Continue With Upgrade
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  )
}

export default ClusterBatchUpgradeDialog
