import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { setStateLens } from 'app/utils/fp'
import { parseValidator } from 'core/utils/fieldValidators'
import { pathEq, toPairs } from 'ramda'
import { withRouter } from 'react-router-dom'

const ValidatedFormContext = React.createContext({})

export const ValidatedFormConsumer = ValidatedFormContext.Consumer
export const ValidatedFormProvider = ValidatedFormContext.Provider

const styles = theme => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
  },
  inputs: {
    display: 'flex',
    flexFlow: 'column wrap',
    paddingRight: '2rem',
    width: '100%',
    maxWidth: '400px',
  },
  formControl: {
    margin: theme.spacing.unit,
  },
})

/**
 * ValidatedForm is a HOC wrapper for forms.  The child components define the
 * data value schema and the validations.
 */
@withRouter
@withStyles(styles)
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
  setFieldValue = (field, value) => {
    this.setState(setStateLens(value, ['values', field]), () => {
      if (this.state.showingErrors ||
        (this.props.showErrorsOnBlur && pathEq(['errors', field, 'hasError'], true, this.state))
      ) {
        this.validateField(field)
      }
      // Pass field up to parent if there is a parent
      if (this.props.setContext) {
        this.props.setContext(this.state.values)
      }
    })
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

  /**
   *  Validate the field and return false on error, true otherwise
   */
  validateField = field => {
    const { fields, values } = this.state
    const fieldValue = values[field]
    const { validations } = fields[field]

    const validationsArray = Array.isArray(validations)
      ? validations
      : toPairs(validations).map(([validationKey, validationSpec]) =>
        parseValidator(validationKey, validationSpec)
      )
    const failedValidation = validationsArray.find(
      validator => !validator.validate(fieldValue, values, field)
    )
    if (failedValidation) {
      this.showFieldErrors(
        field,
        typeof failedValidation.errorMessage === 'function'
          ? failedValidation.errorMessage(fieldValue, values, field)
          : failedValidation.errorMessage
      )
      return false
    }
    this.clearFieldErrors(field)
    return true
  }

  state = {
    initialValues: this.props.initialValues || {},
    values: {},
    fields: {}, // child fields inject data here
    errors: {},
    setFieldValue: this.setFieldValue,
    defineField: this.defineField,
    validateField: this.validateField,
    showingErrors: false,
    showErrorsOnBlur: this.props.showErrorsOnBlur,
  }

  /**
   * Validate all fields and return false if any error is found, true otherwise
   */
  validateForm = () => {
    const { fields } = this.state
    const results = Object.keys(fields).map(field =>
      this.validateField(field)
    )
    return !results.includes(false)
  }

  handleSubmit = event => {
    const { onSubmit } = this.props
    const { values, showingErrors } = this.state
    if (event) {
      event.preventDefault()
    }

    if (!this.validateForm()) {
      if (!showingErrors) {
        this.setState(prevState => ({ ...prevState, showingErrors: true }))
      }
      return
    }

    if (onSubmit) {
      onSubmit(values)
    }
  }

  render () {
    const { classes, id } = this.props
    return (
      <form onSubmit={this.handleSubmit} className={classes.root} id={id}>
        <div className={classes.inputs}>
          <ValidatedFormProvider value={this.state}>{this.props.children}</ValidatedFormProvider>
        </div>
      </form>
    )
  }
}

ValidatedForm.propTypes = {
  // Initial values
  initialValues: PropTypes.object,

  // Set parent context
  onSubmit: PropTypes.func,

  triggerSubmit: PropTypes.func,

  showErrorsOnBlur: PropTypes.bool,
}

export default ValidatedForm
