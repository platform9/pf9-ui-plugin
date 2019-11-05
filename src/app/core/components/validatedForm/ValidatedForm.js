import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import ValidatedFormDebug from './ValidatedFormDebug'
import { withStyles } from '@material-ui/styles'
import { setStateLens } from 'app/utils/fp'
import { parseValidator } from 'core/utils/fieldValidators'
import { pathEq, toPairs, path, lensPath, over, set, identity, dissocPath } from 'ramda'
import { withRouter } from 'react-router-dom'
import moize from 'moize'

export const ValidatedFormContext = React.createContext({})

export const ValidatedFormConsumer = ValidatedFormContext.Consumer
export const ValidatedFormProvider = ValidatedFormContext.Provider

const styles = theme => ({
  root: {
    display: 'flex',
    flexFlow: 'column wrap',
    width: ({ fullWidth }) => fullWidth ? '100%' : '50%',
    maxWidth: ({ fullWidth }) => fullWidth ? null : 400,
    minWidth: 300,
    marginBottom: theme.spacing(1),
    '& .MuiFormControl-root': {
      width: '100%',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  },
})

/**
 * ValidatedForm is a HOC wrapper for forms.  The child components define the
 * data value schema and the validations.
 */
@withRouter
@withStyles(styles, { withTheme: true })
class ValidatedForm extends PureComponent {
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
  defineField = moize(field => spec => {
    this.setState(setStateLens(spec, ['fields', field]))
  })

  removeField = field => {
    this.setState(dissocPath(['fields', field]))
  }

  /**
   * Child components invoke this from their 'onChange' (or equivalent).
   * Note: many components use event.target.value but we only need value here.
   * Note: values can be passed up to parent component by supplying a setContext function prop
   */
  setFieldValue = moize(field => {
    const fieldLens = lensPath(['values', field])
    const hasErrPath = ['errors', field, 'hasError']
    return (value, validateAll) => {
      this.setState(set(fieldLens, value), () => {
        if (this.state.showingErrors ||
          (this.props.showErrorsOnBlur && pathEq(hasErrPath, true, this.state))
        ) {
          if (validateAll) {
            this.validateForm()
          } else {
            this.validateField(field)(null)
          }
        }
      })
    }
  })

  /**
   * This can be used to update a field value using an updaterFn instead of assigning a value directly
   */
  updateFieldValue = moize(field => {
    const fieldLens = lensPath(['values', field])
    const hasErrPath = ['errors', field, 'hasError']
    return (updaterFn, validateAll) => {
      this.setState(over(fieldLens, updaterFn), () => {
        if (this.state.showingErrors ||
          (this.props.showErrorsOnBlur && pathEq(hasErrPath, true, this.state))
        ) {
          if (validateAll) {
            this.validateForm()
          } else {
            this.validateField(field)(null)
          }
        }
      })
    }
  })

  getFieldValue = moize(field => (getterFn = identity) => {
    return getterFn(path(['values', field], this.state))
  })

  /**
   *  Validate the field and return false on error, true otherwise
   */
  validateField = moize(field => () => {
    const { fields, values } = this.state
    const fieldValue = values[field]
    const { validations } = fields[field]

    const validationsArray = Array.isArray(validations)
      ? validations
      : toPairs(validations).map(([validationKey, validationSpec]) =>
        parseValidator(validationKey, validationSpec),
      )
    const failedValidation = validationsArray.find(
      validator => !validator.validate(fieldValue, values, field),
    )
    if (failedValidation) {
      this.showFieldErrors(
        field,
        typeof failedValidation.errorMessage === 'function'
          ? failedValidation.errorMessage(fieldValue, values, field)
          : failedValidation.errorMessage,
      )
      return false
    }
    this.clearFieldErrors(field)
    return true
  })

  /**
   * Store the error state of the field, which will be accessed by child components
   */
  showFieldErrors = (field, errorMessage) => {
    this.setState(
      setStateLens({ errorMessage, hasError: true }, ['errors', field]),
    )
  }

  clearFieldErrors = field => {
    this.setState(setStateLens({ hasError: false }, ['errors', field]))
  }

  state = {
    initialValues: this.props.initialValues || {},
    values: this.props.initialValues || {},
    fields: {}, // child fields inject data here
    errors: {},
    setFieldValue: this.setFieldValue,
    updateFieldValue: this.updateFieldValue,
    getFieldValue: this.getFieldValue,
    defineField: this.defineField,
    removeField: this.removeField,
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
      this.validateField(field)(null),
    )
    return !results.includes(false)
  }

  handleSubmit = event => {
    const { clearOnSubmit, onSubmit } = this.props
    const { initialValues, values, showingErrors } = this.state
    if (event) {
      event.preventDefault()
    }
    if (!this.validateForm()) {
      if (!showingErrors) {
        this.setState(prevState => ({ ...prevState, showingErrors: true }))
      }
      return false
    }

    if (onSubmit) {
      onSubmit(values)
    }

    if (clearOnSubmit) {
      this.setState({ values: initialValues })
    }
    return true
  }

  render () {
    const { children, classes, debug, id } = this.props
    return (
      <form onSubmit={this.handleSubmit} className={classes.root} id={id}>
        <ValidatedFormProvider value={this.state}>
          {debug && <ValidatedFormDebug />}
          {children instanceof Function ? children(this.state) : children}
        </ValidatedFormProvider>
      </form>
    )
  }
}

ValidatedForm.propTypes = {
  // When the form is successfully submitted, clear the form.
  // A common use case for this will be when we want to have the form stay on
  // the screen but each time the user makes a submit we add an item to an array
  // and allow them to add another.
  clearOnSubmit: PropTypes.bool,

  debug: PropTypes.bool,

  // Initial values
  initialValues: PropTypes.object,

  onSubmit: PropTypes.func,

  triggerSubmit: PropTypes.func,

  showErrorsOnBlur: PropTypes.bool,

  // eslint-disable-next-line react/no-unused-prop-types
  fullWidth: PropTypes.bool,
}

ValidatedForm.defaultProps = {
  clearOnSubmit: false,
  debug: false,
}

export default ValidatedForm
