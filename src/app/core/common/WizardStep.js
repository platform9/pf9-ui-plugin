import React from 'react'
import PropTypes from 'prop-types'
import { withWizardContext } from 'core/common/Wizard'

class WizardStep extends React.Component {
  constructor (props) {
    super(props)
    props.addStep({stepId: props.stepId, contents: props.children})
  }

  render = () => null
}

// Validations should be an object with a rule definition
WizardStep.propTypes = {
  stepId: PropTypes.string.isRequired,
}

export default withWizardContext(WizardStep)
