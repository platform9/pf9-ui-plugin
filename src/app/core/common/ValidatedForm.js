import React from 'react'
import PropTypes from 'prop-types'

class ValidatedForm extends React.Component {
  constructor (props) {
    super(props)
    this.initializeFields(false)
  }

  initializeFields (isUpdate = true) {
    const { fields } = this.props

    const constructField = spec => {
      const props = {
        value: spec.initialValue,
        onChange: this.setValue(spec),
      }

      return ({
        ...spec,
        props,
        errors: [], // validation errors will be added here
      })
    }

    const annotatedFields = fields.map(constructField)

    // This MAY need to be called when props update as well.
    if (isUpdate) {
      return this.setState({ fields: annotatedFields })
    }
    this.state = { fields: annotatedFields }
  }

  validate (spec, value) {
    // const constraints = spec.validations
    // TODO: validate the constraints and add to fields[spec.id].errors
  }

  setValue = spec => event => {
    const { fields } = this.state
    this.setState(state => ({
      fields: fields.map(field => {
        if (field.id !== spec.id) {
          return field
        }
        return {
          ...field,
          props: {
            ...field.props,
            value: event.target.value
          }
        }
      })
    }))
    this.validate(spec, event.target.value)
  }

  handleSubmit () {
    console.log('TODO: handleSubmit')
    if (this.props.onSubmit) {
      this.props.onSubmit(this.state)
    }
  }

  /**
   * Invokes the user supplied "renderProps" function with some convenient helpers.
   */
  renderChildContents (renderPropFn) {
    return renderPropFn({
      fields: this.state.fields,
      renderField: this.renderField,
      onSubmit: this.handleSubmit, // The user invokes this from their submit button
      hasErrors: false, // This is set when validation fails
    })
  }

  renderInputField (field) {
    return (
      <input
        type="text"
        id={field.id}
        value={field.props.value}
        placeholder={field.placeholder}
        onChange={field.props.onChange}
      />
    )
  }

  renderField = (field) => {
    if (field.type === 'string') {
      return this.renderInputField(field)
    }
  }

  render () {
    const { children } = this.props
    const contents = children ? this.renderChildContents(children) : null
    return <form onSubmit={this.handleSubmit}>{contents}</form>
  }
}

const FieldSpec = PropTypes.shape({
  id: PropTypes.string.isRequired,
  type: PropTypes.string, // defaults to string
  required: PropTypes.bool, // defaults to false
  validations: PropTypes.arrayOf(PropTypes.object),
  initialValue: PropTypes.any,
  placeholder: PropTypes.string,
})

ValidatedForm.propTypes = {
  fields: PropTypes.arrayOf(FieldSpec).isRequired,
  onSubmit: PropTypes.func
}

export default ValidatedForm
