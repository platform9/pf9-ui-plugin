import React from 'react'
import PropTypes from 'prop-types'
import { withStyles, makeStyles } from '@material-ui/styles'
import { Stepper, StepConnector, Step, StepLabel } from '@material-ui/core'
import clsx from 'clsx'
import { Check } from '@material-ui/icons'
import Text from 'core/elements/text'

const stepIconsSize = 36

const QontoConnector = withStyles((theme) => ({
  alternativeLabel: {
    top: 'auto',
    bottom: 0,
    left: `calc(-50% + ${stepIconsSize}px)`,
    right: `calc(50% + ${stepIconsSize}px)`,
  },
  active: {
    '& $line': {
      borderColor: theme.palette.blue[500],
    },
  },
  completed: {
    '& $line': {
      borderColor: theme.palette.grey[700],
    },
  },
  disabled: {
    '& $line': {
      borderColor: theme.palette.grey[200],
    },
  },
  line: {
    borderTopWidth: 2,
    borderRadius: 0,
  },
}))(StepConnector)

const useQontoStepIconStyles = makeStyles((theme) => ({
  qontoStep: {
    display: 'flex',
    color: theme.palette.grey[500],

    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 8,
      height: 2,
      backgroundColor: theme.palette.grey[200],
    },
  },
  active: {
    color: theme.palette.blue[500],
    '&:after': {
      backgroundColor: theme.palette.blue[500],
    },
  },
  completed: {
    color: theme.palette.grey[700],
    '&:after': {
      backgroundColor: theme.palette.grey[700],
    },
  },
}))

const useWizardStepperStyles = makeStyles((theme) => ({
  stepperRoot: {
    backgroundColor: 'transparent',
    padding: 0,
    flexWrap: 'wrap',
    marginBottom: theme.spacing(4),
    '& .MuiStepConnector-root': {
      display: 'none',
    },
    '& .MuiStep-root': {
      position: 'relative',
      flex: 1,
      padding: theme.spacing(0, 0.5),
    },
  },
  stepLabel: {
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',

    '& .MuiStepLabel-label': {
      ...theme.typography.body1,
      color: theme.palette.grey[500],
    },
    '& .MuiStepLabel-active': {
      color: theme.palette.grey[700],
    },
    '& .MuiStepLabel-completed': {
      color: theme.palette.grey[700],
    },
  },
}))

function QontoStepIcon(props) {
  const classes = useQontoStepIconStyles()
  const { active, completed, icon } = props
  return (
    <Text
      variant="subtitle1"
      className={clsx(classes.qontoStep, {
        [classes.active]: active,
        [classes.completed]: completed,
      })}
    >
      {icon}
    </Text>
  )
}

QontoStepIcon.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool,
}

const WizzardStepper = ({ activeStep, steps }) => {
  const classes = useWizardStepperStyles()
  return (
    <Stepper activeStep={activeStep} connector={<QontoConnector />} className={classes.stepperRoot}>
      {steps.map(({ stepId, label }) => (
        <Step key={stepId}>
          <StepLabel
            variant="body1"
            className={classes.stepLabel}
            StepIconComponent={QontoStepIcon}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  )
}

export default WizzardStepper
