import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { TextField as BaseTextField } from '@material-ui/core'
import { compose } from 'app/utils/fp'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import { withInfoTooltip } from 'core/components/InfoTooltip'
import { withStyles } from '@material-ui/styles'

const styles = () => ({
  // Workaround for label value in outlined TextField overlapping the border
  // https://github.com/mui-org/material-ui/issues/14530
  label: {
    backgroundColor: 'white',
    padding: '0 5px',
    margin: '0 -5px',
  },
})

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
        InputLabelProps={{
          classes: {
            root: classes.label,
          },
        }}
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
  withInfoTooltip, // This HoC causes unnecessary re-renders if declared after withFormContext
  withFormContext,
  withStyles(styles),
)(TextField)
