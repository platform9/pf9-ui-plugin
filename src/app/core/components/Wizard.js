import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@material-ui/core'
import FormButtons from 'core/components/FormButtons'
import ProgressTracker from 'core/components/ProgressTracker'
import { withStyles } from '@material-ui/styles'

const WizardContext = React.createContext({})

export const Consumer = WizardContext.Consumer
export const Provider = WizardContext.Provider

const NextButton = ({ children, handleNext, ...rest }) =>
  <Button variant="outlined" onClick={handleNext} {...rest}>{children}</Button>
const BackButton = ({ handleBack, ...rest }) =>
  <Button variant="outlined" onClick={handleBack} {...rest}>Back</Button>

const styles = theme => ({
  button: { marginRight: theme.spacing.unit },
})

class Wizard extends React.Component {
  isLastStep = () => this.state.step === this.state.steps.length - 1
  isComplete = () => this.state.step > this.state.steps.length - 1
  lastStep = () => this.state.steps.length - 1
  hasNext = () => this.state.step < this.lastStep()
  hasBack = () => this.state.step > 0

  activateStep = () => {
    // Activate the step if we don't have one already
    const { steps, step } = this.state
    if (steps[step]) {
      this.setState({ activeStepId: steps[step].stepId })
    }
  }

  addStep = newStep => {
    this.setState(
      state => ({ steps: [...state.steps, newStep] }),
      this.activateStep
    )
  }

  handleBack = () => {
    this.setState(
      state => ({ step: state.step - 1 }),
      this.activateStep
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
      state => ({ step: state.step + 1 }),
      () => {
        this.activateStep()
        if (this.isComplete()) {
          onComplete(this.state.wizardContext)
        }
      }
    )
  }

  setWizardContext = newValues => {
    this.setState(
      state => ({ wizardContext: { ...state.wizardContext, ...newValues } })
    )
  }

  state = {
    handleBack: this.handleBack,
    handleNext: this.handleNext,
    addStep: this.addStep,
    step: 0,
    steps: [],
    activeStepId: null,
    wizardContext: this.props.context || {},
    setWizardContext: this.setWizardContext,
  }

  render () {
    const { wizardContext, setWizardContext, steps, step } = this.state
    const { children, submitLabel, classes } = this.props

    return (
      <div>
        <Provider value={this.state}>
          <ProgressTracker steps={steps} activeStep={step} />
          {children({ wizardContext, setWizardContext, onNext: this.onNext })}
          <FormButtons>
            {this.hasBack() &&
              <BackButton className={classes.button} handleBack={this.handleBack} />}
            {this.hasNext() &&
              <NextButton className={classes.button} handleNext={this.handleNext}>Next</NextButton>}
            {this.isLastStep() &&
              <NextButton className={classes.button} handleNext={this.handleNext}>{submitLabel}</NextButton>}
          </FormButtons>
        </Provider>
      </div>
    )
  }
}

Wizard.propTypes = {
  onComplete: PropTypes.func,
  context: PropTypes.object,
  submitLabel: PropTypes.string,
  children: PropTypes.func.isRequired,
}

Wizard.defaultProps = {
  submitLabel: 'Complete',
  onComplete: value => {
    console.info('Wizard#onComplete handler not implemented.  Falling back to console.log')
    console.log(value)
  }
}

export default withStyles(styles)(Wizard)

/**
 * withWizardContext provides access to the wizard context through props.
 *
 * This pattern is needed because React does not provide access to context within
 * lifecycle methods (componentDidMount).
 *
 * See: https://github.com/facebook/react/issues/12397#issuecomment-375501574
 *
 * @param {Inject the form context into this Component through props.} Component
 */
export const withWizardContext = Component => props => {
  return (
    <Consumer>
      {
        ({ step, steps, handleBack, handleNext, addStep, activeStepId }) =>
          <Component
            {...props}
            activeStepId={activeStepId}
            step={step}
            steps={steps}
            handleBack={handleBack}
            handleNext={handleNext}
            addStep={addStep}
          />
      }
    </Consumer>
  )
}
