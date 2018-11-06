import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import {
  FormControl,
  FormHelperText,
  TextField as BaseTextField
} from '@material-ui/core'
import { withFormContext } from 'core/common/ValidatedForm'
import { compose, emptyObj, filterFields, pickMultiple } from 'core/fp'
import { requiredValidator } from 'core/FieldValidator'

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit
  }
})

class TextField extends React.Component {
  constructor (props) {
    super(props)
    const spec = props.required
      ? {
        validations: Array.isArray(props.validations)
          ? [requiredValidator, ...props.validations]
          : { required: true, ...props.validations }
      }
      : pickMultiple('validations')(props)
    const { id, initialValue, setField } = this.props

    props.defineField(id, spec)
    if (initialValue !== undefined) {
      setField(id, initialValue)
    }
  }

  get restFields () {
    return filterFields(
      ...withFormContext.propsToExclude,
      'required',
      'classes'
    )(this.props)
  }

  handleChange = e => {
    const { id, onChange, setField, type } = this.props
    // HTML specs says that <input type="number"> return strings but it's more useful if we
    // convert it to a `Number` to reduce type casting all over the place.
    const strVal = e.target.value
    const value =
      type && type.toLowerCase() === 'number' && strVal !== ''
        ? Number(strVal)
        : strVal
    setField(id, value)
    if (onChange) {
      onChange(value)
    }
  }

  handleBlur = e => {
    const { id, showErrorsOnBlur, validateField } = this.props
    if (showErrorsOnBlur) {
      validateField(id)
    }
  }

  render () {
    const { id, value, classes, errors } = this.props
    const { hasError, errorMessage } = errors[id] || emptyObj
    return (
      <FormControl id={id} className={classes.formControl} error={hasError}>
        <BaseTextField
          {...this.restFields}
          error={hasError}
          value={value[id] !== undefined ? value[id] : ''}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
        />
        <FormHelperText>{errorMessage}</FormHelperText>
      </FormControl>
    )
  }
}

TextField.defaultProps = {
  validations: [],
  required: false
}

TextField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  required: PropTypes.bool,
  validations: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func
}

export default compose(withFormContext, withStyles(styles))(TextField)
