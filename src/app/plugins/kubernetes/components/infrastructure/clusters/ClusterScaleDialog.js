import React, { useState, useCallback } from 'react'
import TextField from 'core/components/validatedForm/TextField'
import Checkbox from 'core/components/validatedForm/CheckboxField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { pick } from 'ramda'
import {
  Slider, Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@material-ui/core'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import Progress from 'core/components/progress/Progress'
import useDataUpdater from 'core/hooks/useDataUpdater'

// The modal is technically inside the row, so clicking anything inside
// the modal window will cause the table row to be toggled.
const stopPropagation = e => e.stopPropagation()

const ClusterScaleDialog = ({ rows: [cluster], onClose }) => {
  const [scaleCluster, scalingCluster] = useDataUpdater(clusterActions.scaleCluster, onClose)
  const [sliderValue, setSliderValue] = useState(0.0)
  const [enableSpotWorkers, setEnableSpotWorkers] = useState(false)
  const handleSubmit = useCallback(async ({ numWorkers }) => {
    await scaleCluster({ cluster, numWorkers })
  }, [cluster])

  const handleSlideChange = (e, sliderValue) => setSliderValue(sliderValue)

  // Disabling spot worker feature for now.  It sounds like it is going to change
  // in the near future.
  const spotFeatureEnabled = false

  const initialValues = pick(['numMasters', 'numWorkers'], cluster)
  return (
    <Dialog open onClose={onClose} onClick={stopPropagation}>
      <DialogTitle>Scale Cluster</DialogTitle>
      <ValidatedForm initialValues={initialValues} onSubmit={handleSubmit}>
        <Progress loading={scalingCluster} renderContentOnMount maxHeight={60}>
          <DialogContent>
            <TextField id="numMasters" type="number" label="Num master nodes" disabled />
            <TextField id="numWorkers" type="number" label="Num worker nodes" />
            {spotFeatureEnabled &&
            <Checkbox id="enableSpotWorkers" onChange={() => setEnableSpotWorkers(!enableSpotWorkers)} label="Enable spot workers" />}
            {enableSpotWorkers &&
            <React.Fragment>
              <Slider min={0.0} max={1.0} value={sliderValue} onChange={handleSlideChange} />
              <TextField id="spotPrice" label="Spot price" fullWidth />
            </React.Fragment>}
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Scale Cluster
            </Button>
          </DialogActions>
        </Progress>
      </ValidatedForm>
    </Dialog>
  )
}

export default ClusterScaleDialog
