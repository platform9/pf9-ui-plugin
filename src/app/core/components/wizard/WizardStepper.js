import React from 'react'
import PropTypes from 'prop-types'
import { withStyles, makeStyles } from '@material-ui/styles'
import { Stepper, StepConnector, Step, StepLabel } from '@material-ui/core'
import clsx from 'clsx'
import { Check } from '@material-ui/icons'

const stepIconsSize = 36

const QontoConnector = withStyles(theme => ({
  alternativeLabel: {
    top: 10,
    left: `calc(-50% + ${stepIconsSize}px)`,
    right: `calc(50% + ${stepIconsSize}px)`,
  },
  active: {
    '& $line': {
      borderColor: theme.palette.grey[400],
    },
  },
  completed: {
    '& $line': {
      borderColor: theme.palette.primary.dark,
    },
  },
  disabled: {
    '& $line': {
      borderColor: '#EAEAF0',
    },
  },
  line: {
    borderTopWidth: 3,
    borderRadius: 1,
  },
}))(StepConnector)

const useQontoStepIconStyles = makeStyles(theme => ({
  root: {
    color: '#EAEAF0',
    display: 'flex',
    height: 22,
    alignItems: 'center',
  },
  active: {
    color: '#784AF4',
  },
  circle: {
    width: stepIconsSize,
    height: stepIconsSize,
    lineHeight: `${stepIconsSize}px`,
    borderRadius: stepIconsSize / 2,
    textAlign: 'center',
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.dark,
  },
  completed: {
    height: stepIconsSize / 2,
    marginTop: stepIconsSize / 4,
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.dark,
    zIndex: 1,
    fontSize: 18,
  },
}))

function QontoStepIcon (props) {
  const classes = useQontoStepIconStyles()
  const { active, completed, icon } = props
  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
      })}
    >
      <div className={classes.circle}>{completed
        ? <Check className={classes.completed} />
        : icon}
      </div>
    </div>
  )
}

QontoStepIcon.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool,
}

const WizzardStepper = ({ activeStep, steps }) =>
  <Stepper alternativeLabel activeStep={activeStep} connector={<QontoConnector />}>
    {steps.map(({ stepId, label }) => (
      <Step key={stepId}>
        <StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
      </Step>
    ))}
  </Stepper>

export default WizzardStepper
