
import React from 'react'
import { castFuzzyBool } from 'utils/misc'
import { compose, path } from 'ramda'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core'
import ApiClient from 'api-client/ApiClient'

export const hasPrometheusEnabled = compose(castFuzzyBool, path(['tags', 'pf9-system:monitoring']))

const { appbert } = ApiClient.getInstance()

const PrometheusAddonDialog = ({ rows: [cluster], onClose }) => {
  const enabled = hasPrometheusEnabled(cluster)
  const toggleMonitoring = () => {
    try {
      appbert.getPackages().then(pkgs => {
        const monPkg = (pkgs || []).filter(pkg => (
          pkg.name === 'pf9-mon'
        ))
        if (monPkg === null || monPkg.length === 0) {
          console.log('no monitoring package found')
          onClose()
          return
        }
        const monId = monPkg[0].ID
        appbert.toggleAddon(cluster.uuid, monId, !enabled).then(() => {
          onClose()
        })
      })
    } catch (e) {
      console.log(e)
    }
  }

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
