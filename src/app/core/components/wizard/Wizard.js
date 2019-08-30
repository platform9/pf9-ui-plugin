import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import WizardButtons from 'core/components/wizard/WizardButtons'
import NextButton from 'core/components/buttons/NextButton'
import PrevButton from 'core/components/buttons/PrevButton'
import { ensureFunction } from 'utils/fp'
import WizzardStepper from 'core/components/wizard/WizardStepper'

export const WizardContext = React.createContext({})

class Wizard extends PureComponent {
  isLastStep = () => this.state.activeStep === this.state.steps.length - 1
  isComplete = () => this.state.activeStep > this.state.steps.length - 1
  lastStep = () => this.state.steps.length - 1
  hasNext = () => this.state.activeStep < this.lastStep()
  hasBack = () => this.state.activeStep > 0

  activateStep = () => {
    // Activate the step if we don't have one already
    const { steps, activeStep } = this.state
    if (steps[activeStep]) {
      this.setState({ activeStepId: steps[activeStep].stepId })
    }
  }

  addStep = newStep => {
    this.setState(
      state => ({ steps: [...state.steps, newStep] }),
      this.activateStep,
    )
  }

  handleBack = () => {
    this.setState(
      state => ({ activeStep: state.activeStep - 1 }),
      this.activateStep,
    )
  }

  onNext = (cb) => {
    this.nextCb = cb
  }

  handleNext = () => {
    const { onComplete } = this.props

    if (this.nextCb) {
      this.nextCb()
    }

    this.setState(
      state => ({ activeStep: state.activeStep + 1 }),
      () => {
        this.activateStep()
        if (this.isComplete()) {
          onComplete(this.state.wizardContext)
        }
      },
    )
  }

  setWizardContext = newValues => {
    this.setState(
      state => ({ wizardContext: { ...state.wizardContext, ...newValues } }),
    )
  }

  state = {
    handleBack: this.handleBack,
    handleNext: this.handleNext,
    addStep: this.addStep,
    activeStep: 0,
    steps: [],
    activeStepId: null,
    wizardContext: this.props.context || {},
    setWizardContext: this.setWizardContext,
  }

  render () {
    const { wizardContext, setWizardContext, steps, activeStep } = this.state
    const { children, submitLabel } = this.props
    const renderStepsContent = ensureFunction(children)

    return (
      <WizardContext.Provider value={this.state}>
        <WizzardStepper steps={steps} activeStep={activeStep} />
        {renderStepsContent({ wizardContext, setWizardContext, onNext: this.onNext })}
        <WizardButtons>
          {this.hasBack() &&
          <PrevButton onClick={this.handleBack} />}
          {this.hasNext() &&
          <NextButton onClick={this.handleNext}>Next</NextButton>}
          {this.isLastStep() &&
          <NextButton onClick={this.handleNext}>{submitLabel}</NextButton>}
        </WizardButtons>
      </WizardContext.Provider>
    )
  }
}

Wizard.propTypes = {
  onComplete: PropTypes.func,
  context: PropTypes.object,
  submitLabel: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.func]).isRequired,
}

Wizard.defaultProps = {
  submitLabel: 'Complete',
  onComplete: value => {
    console.info('Wizard#onComplete handler not implemented.  Falling back to console.log')
    console.log(value)
  },
}

export default Wizard
