import React, { FC, useCallback, useMemo, useState } from 'react'
import { Button, Theme, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import BaseOnboardingBanner
  from 'core/components/onboarding/BaseOnboardingBanner'

type NumberType<L extends number> = L
// The next type defines the number of steps
type NumStepsType = NumberType<5>

interface ArrayFixed<T, L extends number> extends Array<T> {
  0: T
  length: L
}

const useStyles = makeStyles<Theme>(theme => ({
  button: {
    lineHeight: 1.2,
    minHeight: theme.spacing(4.5),
    borderRadius: 0,
    backgroundColor: theme.palette.secondary.contrastText,
    color: '#F5A623',
  },
}))

// TODO
const OnboardingBanner: FC = props => {
  const classes = useStyles(props)
  const [currentStep, setCurrentStep] = useState(0)
  const handleStepClick = useCallback(step => {
    setCurrentStep(step)
  }, [])
  const stepsContent = useMemo<ArrayFixed<React.ReactElement, NumStepsType>>(() => [
    <>
      <Typography variant="body1">
        Get started now, and you can have your Kubernetes private cloud
        operational
        within minutes!
      </Typography>
      <Button variant="contained" className={classes.button}>
        + Add Host
      </Button>
    </>,
    <Typography variant="body1">Step 2</Typography>,
    <Typography variant="body1">Step 3</Typography>,
    <Typography variant="body1">Step 4</Typography>,
    <Typography variant="body1">Step 5</Typography>,
  ], [classes])
  const offCourseContent = useMemo<ArrayFixed<string, NumStepsType>>(() => [
    'To proceed with setup, Add a Host',
    'Lorem ipsum',
    'Lorem ipsum',
    'Lorem ipsum',
    'Lorem ipsum',
  ], [])
  const inProgressText = useMemo<ArrayFixed<string, NumStepsType>>(() => [
    'Add Host',
    'Lorem ipsum',
    'Lorem ipsum',
    'Lorem ipsum',
    'Lorem ipsum',
  ], [])

  return <BaseOnboardingBanner
    activeStep={currentStep}
    onStepClick={handleStepClick}
    currentState={'default'}
    stepsContent={stepsContent}
    inProgressText={inProgressText}
    offCourseContent={offCourseContent}
  />
}

export default OnboardingBanner
