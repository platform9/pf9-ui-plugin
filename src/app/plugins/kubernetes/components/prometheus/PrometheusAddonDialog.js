
import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core'

const PrometheusAddonDialog = ({ onClose }) => {
  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Monitoring Add-On (Beta)</DialogTitle>
      <DialogContent>
        <p>
          <b>Note</b> Monitoring is a Beta feature
        </p>
        <p>
          After enabling monitoring add on, you will be able to access prometheus metrics for Kubernets and Grafana
          dashboards. Cluster users will be able to spin up their own prometheus instances for application monitoring.
        </p>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PrometheusAddonDialog
