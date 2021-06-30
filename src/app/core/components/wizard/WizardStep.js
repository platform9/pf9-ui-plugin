import React, { useEffect, useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { WizardContext } from 'core/components/wizard/Wizard'
import { makeStyles } from '@material-ui/styles'
import clsx from 'clsx'

const wizardStepStyles = makeStyles((theme) => ({
  root: {
    display: ({ stepId, activeStepId }) =>
      // Added !important to make sure not even custom styles
      // will override the property when the step is not active
      stepId === activeStepId ? 'block' : ['none', '!important'],
  },
}))

const WizardStep = ({
  label,
  stepId,
  onNext,
  children,
  keepContentMounted,
  validateFields,
  className,
}) => {
  const { activeStepId, addStep } = useContext(WizardContext)
  const classes = wizardStepStyles({ stepId, activeStepId })
  const [rendered, setIsRendered] = useState(false)
  useEffect(() => {
    addStep({ stepId, label, onNext, validateFields })
  }, [])
  useEffect(() => {
    // After we render the step contents for the first time we will keep it mounted
    // (but hidden) to have it quickly available when navigating back and forth
    if (!rendered && activeStepId === stepId) {
      setIsRendered(true)
    }
  }, [activeStepId])

  return activeStepId === stepId || (rendered && keepContentMounted) ? (
    <div className={clsx(classes.root, className)}>{children}</div>
  ) : null
}

// Validations should be an object with a rule definition
WizardStep.propTypes = {
  stepId: PropTypes.string.isRequired,
  label: PropTypes.string,
  onNext: PropTypes.func,
  keepContentMounted: PropTypes.bool,
  className: PropTypes.string,
  validateFields: PropTypes.func,
}

WizardStep.defaultProps = {
  keepContentMounted: true,
}

export default WizardStep
