import React from 'react'
import TextField from 'core/components/validatedForm/TextField'
import Checkbox from 'core/components/validatedForm/Checkbox'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { Slider } from '@material-ui/lab'
import { compose, pick } from 'ramda'
import { withAppContext } from 'core/AppContext'
import { withDataLoader } from 'core/DataLoader'
import { loadInfrastructure } from './actions'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core'

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
    console.log('handleSubmit', this.state)
    this.handleClose()
  }

  handleSlideChange = (e, sliderValue) => this.setState({ sliderValue })

  render () {
    const { enableSpotWorkers, sliderValue } = this.state
    const { row } = this.props
    const initialValues = pick(['numMasters', 'numWorkers'], row)
    console.log(row)
    return (
      <Dialog open onClose={this.handleClose} onClick={stopPropagation} fullWidth>
        <DialogTitle>Scale Cluster</DialogTitle>
        <DialogContent>
          <ValidatedForm setContext={this.handleChange} initialValues={initialValues}>
            <TextField id="numMasters" type="number" label="Num master nodes" fullWidth disabled />
            <TextField id="numWorkers" type="number" label="Num worker nodes" fullWidth />
            <Checkbox id="enableSpotWorkers" label="Enable spot workers" />
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
  withDataLoader({ dataKey: 'clusters', loaderFn: loadInfrastructure }),
  withAppContext,
)(ClusterScaleDialog)
