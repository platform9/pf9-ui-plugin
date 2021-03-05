import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core'
import ApiClient from 'api-client/ApiClient'
import Alert from 'core/components/Alert'
import Progress from 'core/components/progress/Progress'
import useDataLoader from 'core/hooks/useDataLoader'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { notificationActions, NotificationType } from 'core/notifications/notificationReducers'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { clusterTagActions } from '../clusters/actions'

const { appbert } = ApiClient.getInstance()

const ToggleMonitoringDialog = ({ rows: [cluster], onClose }) => {
  const dispatch = useDispatch()
  const [appbertData, loadingAppbertData, reloadAppbert] = useDataLoader(clusterTagActions.list)
  console.log(appbertData, loadingAppbertData)
  const [tagUpdater, updatingTag] = useDataUpdater(clusterTagActions.update, (success) => {
    if (success) {
      onClose()
    }
  })

  const enabled = useMemo(() => {
    if (appbertData?.length) {
      const clusterPackages = appbertData.find((item) => {
        return item.uuid === cluster.uuid
      })
      if (!clusterPackages) {
        return false
      }
      const monitoringPackage = clusterPackages.pkgs.find((pkg) => {
        return pkg.name === 'pf9-mon'
      })
      return monitoringPackage?.installed
    }
    return false
  }, [appbertData])
  console.log(enabled, 'enabled')
  useEffect(() => {
    reloadAppbert()
  }, [])

  const toggleMonitoring = useCallback(async () => {
    try {
      const pkgs: any = await appbert.getPackages()
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

      console.log(cluster.uuid, !enabled)
      await tagUpdater({ clusterId: cluster.uuid, pkg: 'pf9-mon', on: !enabled })
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
      <Progress loading={updatingTag || loadingAppbertData} minHeight={100} maxHeight={200}>
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
