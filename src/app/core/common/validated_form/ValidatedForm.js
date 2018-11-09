import React from 'react'
import PropTypes from 'prop-types'
import { setStateLens } from 'core/fp'
import { withRouter } from 'react-router-dom'
import { pathEq, toPairs } from 'ramda'
import { parseValidator } from 'core/FieldValidator'
import { withStyles } from '@material-ui/core/styles'
import Icon from '@material-ui/core/Icon/Icon'

const ValidatedFormContext = React.createContext({})

export const ValidatedFormConsumer = ValidatedFormContext.Consumer
export const ValidatedFormProvider = ValidatedFormContext.Provider

const styles = theme => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center'
  },
  inputs: {
    display: 'flex',
    flexFlow: 'column nowrap',
    width: '60%',
    paddingRight: '2rem'
  },
  formControl: {
    margin: theme.spacing.unit
  },
  info: {
    width: '40%',
    display: 'flex',
    flexFlow: 'row nowrap'
  },
  infoIcon: {
    fontSize: 'x-large',
    paddingRight: '0.5rem'
  }
})

/**
 * ValidatedForm is a HOC wrapper for forms.  The child components define the
 * data value schema and the validations.
 */
@withRouter
@withStyles(styles)
export default class ValidatedForm extends React.Component {
  constructor (props) {
    super(props)
    if (props.triggerSubmit) {
      props.triggerSubmit(this.handleSubmit)
    }
  }

  static propTypes = {
    // Initial values
    initialValues: PropTypes.object,

    // Set parent context
    onSubmit: PropTypes.func,

    triggerSubmit: PropTypes.func,

    showErrorsOnBlur: PropTypes.bool
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
    } else {
      this.clearFieldErrors(field)
    }
  }

  setCurrentInfo = currentInfo =>
    this.setState(prevState => ({
      ...prevState,
      currentInfo
    }))

  state = {
    initialValues: this.props.initialValues || {},
    values: {},
    fields: {}, // child fields inject data here
    errors: {},
    setFieldValue: this.setFieldValue,
    defineField: this.defineField,
    validateField: this.validateField,
    currentInfo: '',
    showingErrors: false,
    showErrorsOnBlur: this.props.showErrorsOnBlur,
    showInfo: this.setCurrentInfo
  }

  validateForm = () => {
    const { fields } = this.state
    const results = Object.keys(fields).map(field =>
      this.validateField(field)
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

  renderInfo () {
    const { classes } = this.props
    const { currentInfo } = this.state
    return (
      currentInfo && (
        <div className={classes.info}>
          <Icon className={classes.infoIcon} color="primary">
            info
          </Icon>
          {currentInfo}
        </div>
      )
    )
  }

  render () {
    const { classes } = this.props
    return (
      <form onSubmit={this.handleSubmit} className={classes.root}>
        <div className={classes.inputs}>
          <ValidatedFormProvider value={this.state}>{this.props.children}</ValidatedFormProvider>
        </div>
        {this.renderInfo()}
      </form>
    )
  }
}
