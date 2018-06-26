import React from 'react'
import PropTypes from 'prop-types'

const ValidatedFormContext = React.createContext({})

export const Consumer = ValidatedFormContext.Consumer
export const Provider = ValidatedFormContext.Provider

/**
 * ValidatedForm is a HOC wrapper for forms.  The child components define the
 * data value schema and the validations.
 */
class ValidatedForm extends React.Component {
  /**
   * This stores the specification of the field, to be used for validation down the line.
   * This function will be called by the child components when they are initialized.
   */
  defineField = (field, spec) => {
    this.setState(
      state => ({
        ...state,
        fields: {
          ...state.fields,
          [field]: spec
        }
      })
    )
  }

  /**
   * Child components invoke this from their 'onChange' (or equivalent).
   * Note: many components use event.target.value but we only need value here.
   */
  setField = (field, value) => {
    this.setState(
      state => ({
        ...state,
        value: {
          ...state.value,
          [field]: value,
        },
      }),
    )
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
    event.preventDefault()

    if (!this.validateForm()) { return }

    if (onSubmit) {
      onSubmit(this.state.value)
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
  onSubmit: PropTypes.func
}

export default ValidatedForm

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

withFormContext.propsToExclude = ['defineField', 'setField']
