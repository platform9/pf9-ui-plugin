import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import WizardButtons from 'core/components/wizard/WizardButtons'
import NextButton from 'core/components/buttons/NextButton'
import PrevButton from 'core/components/buttons/PrevButton'
import { ensureFunction } from 'utils/fp'
import WizzardStepper from 'core/components/wizard/WizardStepper'
import CancelButton from 'core/components/buttons/CancelButton'

export const WizardContext = React.createContext({})

class Wizard extends PureComponent {
  isLastStep = () => this.state.activeStep === this.state.steps.length - 1
  isComplete = () => this.state.activeStep > this.state.steps.length - 1
  lastStep = () => this.state.steps.length - 1
  hasNext = () => this.state.activeStep < this.lastStep()
  hasBack = () => this.state.activeStep > 0
  isFinishAndReviewVisible = () => this.state.activeStep < this.state.steps.length - 2
  canBackAtFirstStep = () => this.state.activeStep === 0 && !!this.props.originPath

  // Callbacks indexed by step ID to be called before navigating to the next step
  nextCb = {}

  activateStep = () => {
    // Activate the step if we don't have one already
    const { steps, activeStep } = this.state
    if (steps[activeStep]) {
      this.setState({ activeStepId: steps[activeStep].stepId })
    }
  }

  getActiveStepId = ({ steps }, activeStep) => steps[activeStep] ? ({ activeStepId: steps[activeStep].stepId }) : {}

  addStep = newStep => {
    this.setState(
      state => ({ steps: [...state.steps, newStep], ...this.getActiveStepId({ steps: [...state.steps, newStep] }, state.activeStep) })
    )
  }

  handleOriginBack = () => {
    const { history, originPath } = this.props
    history.push(originPath)
  }

  handleBack = () => {
    this.setState(
      state => ({ activeStep: state.activeStep - 1, ...this.getActiveStepId(state, state.activeStep - 1) })
    )
  }

  onNext = (cb) => {
    this.nextCb[this.state.activeStep] = cb
  }

  handleNext = () => {
    const { onComplete } = this.props
    const { activeStep } = this.state

    if (this.nextCb[activeStep] && this.nextCb[activeStep]() === false) {
      return
    }

    this.setState(
      state => ({ activeStep: state.activeStep + 1, ...this.getActiveStepId(state, state.activeStep + 1) }),
      () => {
        if (this.isComplete()) {
          onComplete(this.state.wizardContext)
        }
      },
    )
  }

  onFinishAndReview = () => {
    const { onComplete } = this.props
    const { activeStep } = this.state

    if (this.nextCb[activeStep] && this.nextCb[activeStep]() === false) {
      return
    }

    this.setState(
      state => ({ activeStep: state.steps.length - 1, ...this.getActiveStepId(state, state.steps.length - 1) }),
      () => {
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
    const { showSteps, children, submitLabel, finishAndReviewLabel, onCancel, showFinishAndReviewButton } = this.props
    const renderStepsContent = ensureFunction(children)

    return (
      <WizardContext.Provider value={this.state}>
        {showSteps && <WizzardStepper steps={steps} activeStep={activeStep} />}
        {renderStepsContent({ wizardContext, setWizardContext, onNext: this.onNext })}
        <WizardButtons>
          {onCancel && <CancelButton onClick={onCancel} />}
          {this.hasBack() && <PrevButton onClick={this.handleBack} />}
          {this.canBackAtFirstStep() && <PrevButton onClick={this.handleOriginBack} />}
          {this.hasNext() && <NextButton onClick={this.handleNext}>Next</NextButton>}
          {this.isLastStep() && <NextButton onClick={this.handleNext}>{submitLabel}</NextButton>}
          {showFinishAndReviewButton && this.isFinishAndReviewVisible() && <NextButton onClick={this.onFinishAndReview}>{finishAndReviewLabel}</NextButton>}
        </WizardButtons>
      </WizardContext.Provider>
    )
  }
}

Wizard.propTypes = {
  originPath: PropTypes.string,
  showSteps: PropTypes.bool,
  onComplete: PropTypes.func,
  onCancel: PropTypes.func,
  context: PropTypes.object,
  submitLabel: PropTypes.string,
  showFinishAndReviewButton: PropTypes.bool,
  finishAndReviewLabel: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.func]).isRequired,
}

Wizard.defaultProps = {
  showSteps: true,
  submitLabel: 'Complete',
  finishAndReviewLabel: 'Finish And Review',
  onComplete: value => {
    console.info('Wizard#onComplete handler not implemented.  Falling back to console.log')
    console.log(value)
  },
}

export default withRouter(Wizard)
