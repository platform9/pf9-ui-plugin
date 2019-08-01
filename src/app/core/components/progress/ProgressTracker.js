import React from 'react'
import PropTypes from 'prop-types'
import { Stepper, Step, StepLabel } from '@material-ui/core'

/*
  steps prop should have an array of objects with following properties:

  {
    stepId: <string>,
    label: <string>
  }

  Future work:

  Potentially add handlers that call a function when clicking on a step, ex.
  go back to step 1 when step 1 is clicked
*/
const ProgressCard = ({ steps, activeStep }) =>
  <Stepper activeStep={activeStep}>
    {steps.map((step, index) => {
      return (
        <Step key={step.stepId}>
          <StepLabel>{step.label}</StepLabel>
        </Step>
      )
    })}
  </Stepper>

ProgressCard.propTypes = {
  activeStep: PropTypes.number,
  steps: PropTypes.array,
}

export default ProgressCard
