import React, { useEffect, useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { WizardContext } from 'core/components/wizard/Wizard'
import { makeStyles } from '@material-ui/styles'

const wizardStepStyles = makeStyles(theme => ({
  root: {
    display: ({ stepId, activeStepId }) =>
      stepId === activeStepId ? 'block' : 'none',
  },
}))

const WizardStep = ({ label, stepId, children, keepContentMounted }) => {
  const { activeStepId, addStep } = useContext(WizardContext)
  const classes = wizardStepStyles({ stepId, activeStepId })
  const [rendered, setIsRendered] = useState(false)
  useEffect(() => {
    addStep({ stepId, label })
  }, [])
  useEffect(() => {
    // After we render the step contents for the first time we will keep it mounted
    // (but hidden) to have it quickly available when navigating back and forth
    if (!rendered && activeStepId === stepId) {
      setIsRendered(true)
    }
  }, [activeStepId])

  return activeStepId === stepId || (rendered && keepContentMounted)
    ? <div className={classes.root}>{children}</div>
    : null
}

// Validations should be an object with a rule definition
WizardStep.propTypes = {
  stepId: PropTypes.string.isRequired,
  label: PropTypes.string,
  keepContentMounted: PropTypes.bool,
}

WizardStep.defaultProps = {
  keepContentMounted: true,
}

export default WizardStep
