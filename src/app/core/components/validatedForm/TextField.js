import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { TextField as BaseTextField } from '@material-ui/core'
import { withInfoTooltip } from 'app/core/components/InfoTooltip'
import { compose } from 'app/utils/fp'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'

class TextField extends PureComponent {
  handleChange = e => {
    const { onChange, type } = this.props
    // HTML specs says that <input type="number"> return strings but it's more useful if we
    // convert it to a `Number` to reduce type casting all over the place.
    const strVal = e.target.value
    const value =
      type && type.toLowerCase() === 'number' && strVal !== ''
        ? Number(strVal)
        : strVal

    if (onChange) {
      onChange(value)
    }
  }

  render () {
    const { value, classes, hasError, errorMessage, ...restProps } = this.props
    return (
      <BaseTextField
        {...restProps}
        variant="outlined"
        error={hasError}
        value={value !== undefined ? value : ''}
        onChange={this.handleChange}
        helperText={errorMessage}
      />
    )
  }
}

TextField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  info: PropTypes.string,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}

export default compose(
  withFormContext,
  withInfoTooltip,
)(TextField)
