import React from 'react'
import PropTypes from 'prop-types'
import { Button } from '@material-ui/core'
import FormButtons from 'core/common/FormButtons'
import ProgressTracker from 'core/common/ProgressTracker'

const WizardContext = React.createContext({})

export const Consumer = WizardContext.Consumer
export const Provider = WizardContext.Provider

const NextButton = ({ children, handleNext }) => <Button variant="outlined" onClick={handleNext}>{children}</Button>
const BackButton = ({ handleBack }) => <Button variant="outlined" onClick={handleBack}>Back</Button>

class Wizard extends React.Component {
  addStep = (newStep) => {
    this.setState((state) => {
      return {steps: [...state.steps, newStep]}
    })
  }

  handleBack = () => {
    this.setState((prevState, props) => {
      return {step: prevState.step - 1}
    })
  }

  onNext = (cb) => {
    this.nextCb = cb
  }

  handleNext = () => {
    const { step, steps } = this.state
    const { onComplete } = this.props

    if (this.nextCb) {
      this.nextCb()
    }

    this.setState((prevState, props) => {
      return {step: prevState.step + 1}
    }, () => {
      // If last step, call onComplete()
      if (step === steps.length - 1) {
        onComplete(this.state.context)
      }
    })
  }

  setContext = (newValues) => {
    this.setState((prevState, props) => {
      return {context: { ...prevState.context, ...newValues }}
    })
  }

  state = {
    handleBack: this.handleBack,
    handleNext: this.handleNext,
    addStep: this.addStep,
    step: 0,
    steps: [],
    context: this.props.context || {},
    setContext: this.setContext,
  }

  render () {
    const { context, setContext, steps, step } = this.state
    const lastStep = this.state.steps.length - 1
    const activeStepId = steps[step] && steps[step].stepId

    return (
      <div>
        <Provider value={this.state}>
          <ProgressTracker steps={steps} activeStep={step} />
          {this.props.children({ context, setContext, onNext: this.onNext, activeStepId })}
          <FormButtons>
            { step > 0 && <BackButton handleBack={this.handleBack} /> }
            { step < lastStep && <NextButton handleNext={this.handleNext}>Next</NextButton> }
            { step === lastStep && <NextButton handleNext={this.handleNext}>Add Volume</NextButton> }
          </FormButtons>
        </Provider>
      </div>
    )
  }
}

Wizard.propTypes = {
  onComplete: PropTypes.func,
  context: PropTypes.object
}

export default Wizard

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
        ({ step, steps, handleBack, handleNext, addStep }) =>
          <Component
            {...props}
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
