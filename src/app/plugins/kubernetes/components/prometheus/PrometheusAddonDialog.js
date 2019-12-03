
import React, { useCallback } from 'react'
import { castFuzzyBool } from 'utils/misc'
import { compose, path } from 'ramda'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core'
import ApiClient from 'api-client/ApiClient'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { clusterActions } from '../infrastructure/clusters/actions'

export const hasPrometheusEnabled = compose(castFuzzyBool, path(['tags', 'pf9-system:monitoring']))

const { appbert } = ApiClient.getInstance()

const PrometheusAddonDialog = ({ rows: [cluster], onClose }) => {
  const enabled = hasPrometheusEnabled(cluster)
  const [tagUpdater] = useDataUpdater(clusterActions.updateTag, success => {
    if (success) {
      onClose()
    }
  })

  const toggleMonitoring = useCallback(async () => {
    try {
      const pkgs = await appbert.getPackages()
      const monPkg = pkgs.find(pkg => (
        pkg.name === 'pf9-mon'
      ))

      if (!monPkg) {
        console.log('no monitoring package found')
        return
      }

      const monId = monPkg.ID
      await appbert.toggleAddon(cluster.uuid, monId, !enabled)
    } catch (e) {
      // TODO: Raise toaster notification
      console.log(e)
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
          After enabling monitoring add on, you will be able to access prometheus metrics and Grafana
          dashboards for Kubernetes. In addition, users will be able to spin up their own prometheus instances for application monitoring.
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
