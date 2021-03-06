import Bugsnag from '@bugsnag/js'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core'
import ApiClient from 'api-client/ApiClient'
import Alert from 'core/components/Alert'
import Progress from 'core/components/progress/Progress'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { notificationActions, NotificationType } from 'core/notifications/notificationReducers'
import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { trackEvent } from 'utils/tracking'
import { clusterTagActions } from '../clusters/actions'
import { importedHasPrometheusTag } from 'k8s/components/infrastructure/clusters/helpers'

const { appbert } = ApiClient.getInstance()

const ToggleMonitoringDialog = ({ rows: [cluster], onClose }) => {
  const dispatch = useDispatch()
  const [tagUpdater, updatingTag] = useDataUpdater(clusterTagActions.update, (success) => {
    if (success) {
      onClose()
    }
  })

  const enabled = importedHasPrometheusTag(cluster)

  const toggleMonitoring = useCallback(async () => {
    Bugsnag.leaveBreadcrumb(
      `Attempting to toggle monitoring ${enabled ? 'off' : 'on'} for imported cluster`,
      { clusterId: cluster.uuid },
    )
    try {
      const pkgs: any = await appbert.getPackages()
      const monPkg = pkgs.find((pkg) => pkg.name === 'pf9-mon')

      if (enabled) {
        trackEvent('Imported Cluster - Toggle Monitoring Off', {
          cluster_uuid: cluster.uuid,
          cluster_name: cluster.name,
          cloud_provider_type: cluster.providerType,
        })
      } else {
        trackEvent('Imported Cluster - Toggle Monitoring On', {
          cluster_uuid: cluster.uuid,
          cluster_name: cluster.name,
          cloud_provider_type: cluster.providerType,
        })
      }

      if (!monPkg) {
        dispatch(
          notificationActions.registerNotification({
            title: 'Prometheus error',
            message: 'No monitoring package found',
            type: NotificationType.error,
          }),
        )
        return onClose(false)
      }
      await tagUpdater({ clusterId: cluster.uuid, pkg: monPkg.ID, on: !enabled })
    } catch (e) {
      dispatch(
        notificationActions.registerNotification({
          title: 'Prometheus error',
          message: 'Failed to update monitoring status',
          type: NotificationType.error,
        }),
      )
      return onClose(false)
    }
  }, [tagUpdater, cluster, enabled])

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Monitoring Add-On (Beta)</DialogTitle>
      <Progress loading={updatingTag} minHeight={100} maxHeight={200}>
        <DialogContent>
          <p>
            After enabling the monitoring add-on, you will be able to access Prometheus metrics and
            Grafana dashboards for Kubernetes. In addition, users will be able to spin up their own
            Prometheus instances for application monitoring.
          </p>
          <Alert small variant="warning" message="Monitoring is currently a Beta feature" />
        </DialogContent>
        <DialogActions>
          <Button color="primary" type="submit" variant="contained" onClick={toggleMonitoring}>
            {enabled ? 'Disable' : 'Enable'}
          </Button>
          <Button variant="contained" onClick={onClose}>
            Cancel
          </Button>
        </DialogActions>
      </Progress>
    </Dialog>
  )
}

export default ToggleMonitoringDialog
