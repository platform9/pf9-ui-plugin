import React from 'react'
import PropTypes from 'prop-types'
import { compose, setStateLens } from 'core/fp'
import { withRouter } from 'react-router-dom'

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
    this.setState(setStateLens(value, ['value', field]))
    // Pass field up to parent if there is a parent
    if (this.props.setContext) {
      this.props.setContext(this.state.value)
    }
  }

  state = {
    value: this.props.initialValue || {},
    fields: {}, // child fields inject data here
    setField: this.setField,
    defineField: this.defineField,
  }

  validateField = (field, value, validations, spec) => {
    // TODO: just a placeholder for now
    return true
  }

  validateForm = () => {
    const { fields, value } = this.state
    return Object.keys(fields).every(field => this.validateField(field, value[field], fields[field]))
  }

  handleSubmit = event => {
    const { onSubmit } = this.props
    const { value } = this.state
    if (event) {
      event.preventDefault()
    }

    if (!this.validateForm()) { return }

    if (onSubmit) {
      onSubmit(value)
    }
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <Provider value={this.state}>
          {this.props.children}
        </Provider>
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
}

export const PropKeys = Object.keys(ValidatedForm.propTypes)

export default compose(
  withRouter,
)(ValidatedForm)

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
export const withFormContext = Component => props =>
  <Consumer>
    {
      ({ defineField, setField, value }) =>
        <Component
          {...props}
          defineField={defineField}
          setField={setField}
          value={value}
        />
    }
  </Consumer>

withFormContext.propsToExclude = ['defineField', 'setField', 'initialValue']
