import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core'
import ApiClient from 'api-client/ApiClient'
import { onboardingMonitoringSetup } from 'app/constants'
import Alert from 'core/components/Alert'
import Progress from 'core/components/progress/Progress'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { notificationActions, NotificationType } from 'core/notifications/notificationReducers'
import { hasPrometheusTag } from 'k8s/components/infrastructure/clusters/helpers'
import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { clusterActions } from '../infrastructure/clusters/actions'

const { appbert } = ApiClient.getInstance()

const PrometheusAddonDialog = ({ rows: [cluster], onClose }) => {
  const enabled = hasPrometheusTag(cluster)
  const dispatch = useDispatch()
  const [tagUpdater, updatingTag] = useDataUpdater(clusterActions.updateTag, (success) => {
    if (success) {
      onClose()
    }
  })

  const toggleMonitoring = useCallback(async () => {
    try {
      const pkgs = await appbert.getPackages()
      const monPkg = pkgs.find((pkg) => pkg.name === 'pf9-mon')

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

      const monId = monPkg.ID
      await appbert.toggleAddon(cluster.uuid, monId, !enabled)
      if (!enabled) {
        localStorage.setItem(onboardingMonitoringSetup, 'true')
      }
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

    const val = !enabled
    const key = 'pf9-system:monitoring'
    tagUpdater({ cluster, key, val })
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

export default PrometheusAddonDialog
