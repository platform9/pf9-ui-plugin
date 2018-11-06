import React from 'react'
import PropTypes from 'prop-types'
import { compose, setStateLens } from 'core/fp'
import { withRouter } from 'react-router-dom'
import { pathEq, toPairs } from 'ramda'
import { parseValidator } from 'core/FieldValidator'

const ValidatedFormContext = React.createContext({})

export const Consumer = ValidatedFormContext.Consumer
export const Provider = ValidatedFormContext.Provider

/**
 * ValidatedForm is a HOC wrapper for forms.  The child components define the
 * data value schema and the validations.
 */
class ValidatedForm extends React.Component {
  constructor (props) {
    super(props)
    if (props.triggerSubmit) {
      props.triggerSubmit(this.handleSubmit)
    }
  }
  /**
   * This stores the specification of the field, to be used for validation down the line.
   * This function will be called by the child components when they are initialized.
   */
  defineField = (field, spec) => {
    this.setState(setStateLens(spec, ['fields', field]))
  }

  /**
   * Child components invoke this from their 'onChange' (or equivalent).
   * Note: many components use event.target.value but we only need value here.
   * Note: values can be passed up to parent component by supplying a setContext function prop
   */
  setField = (field, value) => {
    this.setState(setStateLens(value, ['value', field]), () => {
      if (
        this.state.showingErrors ||
        (this.props.showErrorsOnBlur &&
          pathEq(['errors', field, 'hasError'], true, this.state))
      ) {
        this.validateField(field)
      }
    })
    // Pass field up to parent if there is a parent
    if (this.props.setContext) {
      this.props.setContext(this.state.value)
    }
  }

  /**
   * Store the error state of the field, which will be accessed by child components
   */
  showFieldErrors = (field, errorMessage) => {
    this.setState(
      setStateLens({ errorMessage, hasError: true }, ['errors', field])
    )
  }

  clearFieldErrors = field => {
    this.setState(setStateLens({ hasError: false }, ['errors', field]))
  }

  validateField = field => {
    const { fields, value } = this.state
    const fieldValue = value[field]
    const { validations } = fields[field]

    const validationsArray = Array.isArray(validations)
      ? validations
      : toPairs(validations).map(([validationKey, validationSpec]) =>
        parseValidator(validationKey, validationSpec)
      )
    const failedValidation = validationsArray.find(
      validator => !validator.validate(fieldValue, value, field)
    )
    if (failedValidation) {
      this.showFieldErrors(
        field,
        typeof failedValidation.errorMessage === 'function'
          ? failedValidation.errorMessage(fieldValue, value, field)
          : failedValidation.errorMessage
      )
    } else {
      this.clearFieldErrors(field)
    }
  }

  state = {
    value: this.props.initialValue || {},
    showingErrors: false,
    showErrorsOnBlur: this.props.showErrorsOnBlur,
    fields: {}, // child fields inject data here
    errors: {},
    setField: this.setField,
    defineField: this.defineField,
    validateField: this.validateField
  }

  validateForm = () => {
    const { fields, value } = this.state
    const results = Object.keys(fields).map(field =>
      this.validateField(field, value[field], fields[field])
    )
    return results.includes(true)
  }

  handleSubmit = event => {
    const { onSubmit } = this.props
    const { value, showingErrors } = this.state
    if (event) {
      event.preventDefault()
    }

    if (!this.validateForm() && !showingErrors) {
      this.setState(prevState => ({ ...prevState, showingErrors: true }))
      return
    }

    if (onSubmit) {
      onSubmit(value)
    }
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <Provider value={this.state}>{this.props.children}</Provider>
      </form>
    )
  }
}

ValidatedForm.propTypes = {
  // Initial values
  initialValue: PropTypes.object,

  // Set parent context
  onSubmit: PropTypes.func,

  triggerSubmit: PropTypes.func,

  showErrorsOnBlur: PropTypes.bool
}

export const PropKeys = Object.keys(ValidatedForm.propTypes)

export default compose(withRouter)(ValidatedForm)

/**
 * withFormContext provides access to the form context through props.
 *
 * This pattern is needed because React does not provide access to context within
 * lifecycle methods (componentDidMount).
 *
 * See: https://github.com/facebook/react/issues/12397#issuecomment-375501574
 *
 * @param {Inject the form context into this Component through props.} Component
 */
export const withFormContext = Component => props => (
  <Consumer>
    {({
      defineField,
      setField,
      value,
      showErrorsOnBlur,
      validateField,
      errors
    }) => (
      <Component
        {...props}
        defineField={defineField}
        setField={setField}
        value={value}
        errors={errors}
        showErrorsOnBlur={showErrorsOnBlur}
        validateField={validateField}
      />
    )}
  </Consumer>
)

withFormContext.propsToExclude = [
  'defineField',
  'setField',
  'initialValue',
  'showErrorsOnBlur',
  'validations',
  'errors',
  'validateField'
]
