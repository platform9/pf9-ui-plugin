import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import WizardButtons from 'core/components/wizard/WizardButtons'
import NextButton from 'core/components/buttons/NextButton'
import PrevButton from 'core/components/buttons/PrevButton'
import { ensureFunction } from 'utils/fp'
import WizardStepper from 'core/components/wizard/WizardStepper'
import CancelButton from 'core/components/buttons/CancelButton'

export const WizardContext = React.createContext({})

class Wizard extends PureComponent {
  componentDidMount() {
    this.setState({ activeStep: this.props.startingStep })
  }

  isLastStep = () => this.state.activeStep === this.state.steps.length - 1
  isComplete = () => this.state.activeStep > this.state.steps.length - 1
  lastStep = () => this.state.steps.length - 1
  hasNext = () => this.state.activeStep < this.lastStep() && !this.props.disableNext
  hasBack = () => !this.props.hideBack && this.state.activeStep > 0
  isFinishAndReviewVisible = () =>
    this.state.activeStep < this.state.steps.length - 2 && !this.props.disableNext

  canBackAtFirstStep = () =>
    !this.props.hideBack && this.state.activeStep === 0 && !!this.props.originPath

  // Callbacks indexed by step ID to be called before navigating to the next step
  nextCb = {}

  activateStep = () => {
    // Activate the step if we don't have one already
    const { steps, activeStep } = this.state
    if (steps[activeStep]) {
      this.setState({ activeStepId: steps[activeStep].stepId })
    }
  }

  getActiveStepId = ({ steps }, activeStep) =>
    steps[activeStep] ? { activeStepId: steps[activeStep].stepId } : {}

  addStep = (newStep) => {
    this.setState((state) => ({
      steps: [...state.steps, newStep],
      ...this.getActiveStepId({ steps: [...state.steps, newStep] }, state.activeStep),
    }))
  }

  handleOriginBack = () => {
    const { history, originPath } = this.props
    history.push(originPath)
  }

  handleBack = () => {
    this.setState((state) => ({
      activeStep: state.activeStep - 1,
      ...this.getActiveStepId(state, state.activeStep - 1),
    }))
  }

  onNext = (cb) => {
    this.nextCb[this.state.activeStep] = cb
  }

  handleNext = async () => {
    const { onComplete } = this.props
    const { steps, activeStep, wizardContext } = this.state

    // This is triggerSubmit in the ValidatedForm
    if (this.nextCb[activeStep]) {
      const ok = await this.nextCb[activeStep]()
      if (!ok) {
        return
      }
    }

    this.setState(
      (state) => ({
        activeStep: state.activeStep + 1,
        ...this.getActiveStepId(state, state.activeStep + 1),
      }),
      () => {
        if (steps[activeStep]?.onNext) {
          steps[activeStep].onNext(wizardContext)
        }
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
      (state) => ({
        activeStep: state.steps.length - 1,
        ...this.getActiveStepId(state, state.steps.length - 1),
      }),
      () => {
        if (this.isComplete()) {
          onComplete(this.state.wizardContext)
        }
      },
    )
  }

  setWizardContext = (newValues, cb) => {
    this.setState(
      (state) => ({ wizardContext: { ...state.wizardContext, ...newValues } }),
      () => {
        if (cb) {
          cb(this.state.wizardContext)
        }
      },
    )
  }

  state = {
    handleBack: this.handleBack,
    handleNext: this.handleNext,
    addStep: this.addStep,
    activeStep: this.props.startingStep || 0,
    steps: [],
    activeStepId: null,
    wizardContext: this.props.context || {},
    setWizardContext: this.setWizardContext,
  }

  render() {
    const { wizardContext, setWizardContext, steps, activeStep } = this.state
    const {
      showSteps,
      children,
      submitLabel,
      finishAndReviewLabel,
      onCancel,
      showFinishAndReviewButton,
      hideAllButtons,
    } = this.props
    const shouldShowFinishAndReview =
      typeof showFinishAndReviewButton === 'function'
        ? showFinishAndReviewButton(wizardContext)
        : showFinishAndReviewButton
    const renderStepsContent = ensureFunction(children)

    return (
      <WizardContext.Provider value={this.state}>
        {showSteps && <WizardStepper steps={steps} activeStep={activeStep} />}
        {renderStepsContent({
          wizardContext,
          setWizardContext,
          onNext: this.onNext,
          handleNext: this.handleNext,
        })}
        {!hideAllButtons && (
          <WizardButtons>
            {onCancel && <CancelButton onClick={onCancel} />}
            {this.hasBack() && <PrevButton onClick={this.handleBack} />}
            {this.canBackAtFirstStep() && <PrevButton onClick={this.handleOriginBack} />}
            {this.hasNext() && <NextButton onClick={this.handleNext}>Next</NextButton>}
            {this.isLastStep() && <NextButton onClick={this.handleNext}>{submitLabel}</NextButton>}
            {shouldShowFinishAndReview && this.isFinishAndReviewVisible() && (
              <NextButton onClick={this.onFinishAndReview} showForward={false}>
                {finishAndReviewLabel}
              </NextButton>
            )}
          </WizardButtons>
        )}
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
  showFinishAndReviewButton: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  finishAndReviewLabel: PropTypes.string,
  disableNext: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.func]).isRequired,
  startingStep: PropTypes.number,
  hideBack: PropTypes.bool,
  hideAllButtons: PropTypes.bool,
}

Wizard.defaultProps = {
  showSteps: true,
  submitLabel: 'Complete',
  finishAndReviewLabel: 'Finish and Review',
  onComplete: (value) => {
    console.info('Wizard#onComplete handler not implemented.  Falling back to console.log')
    console.log(value)
  },
  startingStep: 0,
  hideBack: false,
  hideAllButtons: false,
}

export default withRouter(Wizard)
