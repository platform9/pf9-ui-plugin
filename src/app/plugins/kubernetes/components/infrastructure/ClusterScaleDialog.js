import React from 'react'
import TextField from 'core/components/validatedForm/TextField'
import Checkbox from 'core/components/validatedForm/CheckboxField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { compose, pick, pathOr } from 'ramda'
import { withAppContext } from 'core/AppContext'
import { scaleCluster, loadClusters } from './actions'
import {
  Slider, Button, Dialog, DialogActions, DialogContent, DialogTitle,
} from '@material-ui/core'
import withDataLoader from 'core/hocs/withDataLoader'
import withDataMapper from 'core/hocs/withDataMapper'

// The modal is technically inside the row, so clicking anything inside
// the modal window will cause the table row to be toggled.
const stopPropagation = e => e.stopPropagation()

class ClusterScaleDialog extends React.Component {
  state = {
    sliderValue: 0.0
  }
  handleClose = () => this.props.onClose && this.props.onClose()
  handleChange = value => this.setState(state => ({ ...state, ...value }))

  handleSubmit = async (e) => {
    const { row, context, setContext } = this.props
    const { numWorkers } = this.state
    const data = { cluster: row, numWorkers }
    await scaleCluster({ data, context, setContext })
    this.handleClose()
  }

  handleSlideChange = (e, sliderValue) => this.setState({ sliderValue })

  render () {
    // Disabling spot worker feature for now.  It sounds like it is going to change
    // in the near future.
    const spotFeatureEnabled = false

    const { enableSpotWorkers, sliderValue } = this.state
    const { row } = this.props
    const initialValues = pick(['numMasters', 'numWorkers'], row)
    return (
      <Dialog open onClose={this.handleClose} onClick={stopPropagation} fullWidth>
        <DialogTitle>Scale Cluster</DialogTitle>
        <DialogContent>
          <ValidatedForm setContext={this.handleChange} initialValues={initialValues}>
            <TextField id="numMasters" type="number" label="Num master nodes" fullWidth disabled />
            <TextField id="numWorkers" type="number" label="Num worker nodes" fullWidth />
            {spotFeatureEnabled && <Checkbox id="enableSpotWorkers" label="Enable spot workers" />}
            {enableSpotWorkers &&
              <React.Fragment>
                <Slider min={0.0} max={1.0} value={sliderValue} onChange={this.handleSlideChange} />
                <TextField id="spotPrice" label="Spot price" fullWidth />
              </React.Fragment>
            }
          </ValidatedForm>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color="primary">Cancel</Button>
          <Button onClick={this.handleSubmit} color="primary">Scale Cluster</Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default compose(
  withAppContext,
  withDataLoader({ clusters: loadClusters }),
  withDataMapper({ clusters: pathOr([], ['context', 'clusters']) }),
)(ClusterScaleDialog)
