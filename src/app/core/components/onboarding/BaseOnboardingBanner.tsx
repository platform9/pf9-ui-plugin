import React, { FC, MouseEventHandler, useCallback } from 'react'
import BannerContent from 'core/components/notifications/BannerContent'
import { Theme, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { range } from 'ramda'
import { objSwitchCase } from 'utils/fp'

const stepIconsSize = 20

const useStyles = makeStyles<Theme>(theme => ({
  title: {
    display: 'flex',
    alignItems: 'center',
    color: 'inherit',
  },
  body: {
    padding: theme.spacing(0, 2),
    display: 'flex',
    alignItems: 'center',
    color: 'inherit',
    '& p': {
      color: 'inherit',
      maxWidth: 460,
      paddingRight: theme.spacing(4),
    },
  },
  steps: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'inherit',
    padding: 0,
    backgroundColor: 'inherit',
    fontSize: theme.typography.body2.fontSize,
  },
  inProgress: {
    marginLeft: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing(2),
    display: 'flex',
  },
}))

interface StepProps {
  active: boolean
  completed: boolean
  step: number
  onClick: MouseEventHandler
}

const useStepStyles = makeStyles<Theme, StepProps>(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: theme.spacing(0, 1),
    fontWeight: 'bold',
    width: stepIconsSize,
    height: stepIconsSize,
    lineHeight: `${stepIconsSize}px`,
    borderRadius: stepIconsSize / 2,
    textAlign: 'center',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: ({ active, completed }) => active || completed
      ? 'transparent' : theme.palette.primary.contrastText,
    backgroundColor: ({ active, completed }) => active || completed
      ? '#FAD291' : 'inherit',
    color: ({ active }) => active ? '#F5A623' : theme.palette.primary.contrastText,
    cursor: ({ completed }) => completed ? 'pointer' : 'default',
  },
}))

const BannerStep: FC<StepProps> = props => {
  const classes = useStepStyles(props)
  const { step, onClick } = props
  return (
    <div className={classes.root} onClick={onClick}>
      {step}
    </div>
  )
}

interface OnboardingBannerProps {
  title?: string
  activeStep: number
  onStepClick: (numStep: number) => void
  currentState: 'default' | 'inProgress' | 'offCourse'
  stepsContent: React.ReactNode[]
  offCourseContent: React.ReactNode[]
  inProgressText: string[]
}

const BaseOnboardingBanner: FC<OnboardingBannerProps> = props => {
  const classes = useStyles(props)
  const {
    title = 'Welcome to Platform9',
    activeStep,
    currentState,
    stepsContent,
    inProgressText,
    offCourseContent,
    onStepClick,
  } = props
  const numSteps = stepsContent.length
  const steps = range(1, numSteps + 1)
  const handleStepClick = useCallback(step => {
    if (step <= activeStep) {
      onStepClick(step)
    }
  }, [activeStep])
  const renderContent: (currentState: string) => React.ReactNode = objSwitchCase({
    default: stepsContent[activeStep],
    offCourse: offCourseContent[activeStep],
  }, null)

  return <BannerContent>
    <Typography variant="subtitle2" className={classes.title}>
      {title}
    </Typography>
    <div className={classes.body}>
      {renderContent(currentState)}
    </div>
    {currentState === 'inProgress' && <div className={classes.inProgress}>
      In Progress: {inProgressText[activeStep]}
    </div>}
    <div className={classes.steps}>
      {steps.map(step => (
        <BannerStep
          key={step}
          onClick={() => handleStepClick(step)}
          active={activeStep + 1 === step}
          completed={activeStep + 1 > step}
          step={step} />
      ))}
    </div>
  </BannerContent>
}

export default BaseOnboardingBanner
