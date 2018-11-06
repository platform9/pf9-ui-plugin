import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import {
  Checkbox as BaseCheckbox,
  FormControl,
  FormControlLabel,
  FormHelperText
} from '@material-ui/core'
import { withFormContext } from 'core/common/ValidatedForm'
import { compose, emptyObj, filterFields, pickMultiple } from 'core/fp'
import { requiredValidator } from 'core/FieldValidator'

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit
  }
})

class Checkbox extends React.Component {
  constructor (props) {
    super(props)
    const spec = props.required
      ? {
        validations: Array.isArray(props.validations)
          ? [requiredValidator, ...props.validations]
          : { required: true, ...props.validations }
      }
      : pickMultiple('validations')(props)

    props.defineField(props.id, spec)
  }

  get restFields () {
    return filterFields(
      ...withFormContext.propsToExclude,
      'required',
      'classes',
      'value'
    )(this.props)
  }

  handleChange = e => {
    const { id, onChange, setField } = this.props
    setField(id, e.target.checked)
    if (onChange) {
      onChange(e.target.checked)
    }
  }

  render () {
    const { id, value, label, errors, classes } = this.props
    const { hasError, errorMessage } = errors[id] || emptyObj
    return (
      <FormControl id={id} className={classes.formControl} error={hasError}>
        <FormControlLabel
          label={label}
          control={
            <BaseCheckbox
              {...this.restFields}
              error={errorMessage}
              checked={value[id]}
              onChange={this.handleChange}
            />
          }
        />
        <FormHelperText>{errorMessage}</FormHelperText>
      </FormControl>
    )
  }
}

Checkbox.defaultProps = {
  validations: []
}

Checkbox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  validations: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  initialValue: PropTypes.bool,
  onChange: PropTypes.func
}

export default compose(withFormContext, withStyles(styles))(Checkbox)
