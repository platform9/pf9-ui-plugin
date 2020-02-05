import React, { useCallback } from 'react'
import { castFuzzyBool } from 'utils/misc'
import { compose, path } from 'ramda'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core'
import ApiClient from 'api-client/ApiClient'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { clusterActions } from '../infrastructure/clusters/actions'
import { onboardingMonitoringSetup } from 'app/constants'
import { useToast } from 'core/providers/ToastProvider'

export const hasPrometheusEnabled = compose(castFuzzyBool, path(['tags', 'pf9-system:monitoring']))

const { appbert } = ApiClient.getInstance()

const PrometheusAddonDialog = ({ rows: [cluster], onClose }) => {
  const enabled = hasPrometheusEnabled(cluster)
  const showToast = useToast()
  const [tagUpdater] = useDataUpdater(clusterActions.updateTag, (success) => {
    if (success) {
      onClose(success)
    }
  })

  const toggleMonitoring = useCallback(async () => {
    try {
      const pkgs = await appbert.getPackages()
      const monPkg = pkgs.find((pkg) => pkg.name === 'pf9-mon')

      if (!monPkg) {
        showToast('No monitoring package found', 'error')
        return onClose(false)
      }

      const monId = monPkg.ID
      await appbert.toggleAddon(cluster.uuid, monId, !enabled)
      if (!enabled) {
        localStorage.setItem(onboardingMonitoringSetup, 'true')
      }
    } catch (e) {
      showToast('Failed to update monitoring status', 'error')
      return onClose(false)
    }

    const val = !enabled
    const key = 'pf9-system:monitoring'
    tagUpdater({ cluster, key, val })
  }, [tagUpdater, cluster, enabled])

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Monitoring Add-On (Beta)</DialogTitle>
      <DialogContent>
        <p>
          <b>Note:</b> Monitoring is a Beta feature
        </p>
        <p>
          After enabling the monitoring add-on, you will be able to access Prometheus metrics and
          Grafana dashboards for Kubernetes. In addition, users will be able to spin up their own
          Prometheus instances for application monitoring.
        </p>
      </DialogContent>
      <DialogActions>
        <Button color="primary" type="submit" variant="contained" onClick={toggleMonitoring}>
          {enabled ? 'Disable' : 'Enable'}
        </Button>
        <Button variant="contained" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PrometheusAddonDialog
