import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import {
  FormControl,
  FormHelperText,
  TextField as BaseTextField
} from '@material-ui/core'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import { compose } from 'core/../../../utils/fp'
import { withInfoTooltip } from 'app/core/components/InfoTooltip'

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit
  }
})

class TextField extends React.Component {
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
    const { id, value, classes, hasError, errorMessage, ...restProps } = this.props
    return (
      <FormControl id={id} className={classes.formControl} error={hasError}>
        <BaseTextField
          {...restProps}
          error={hasError}
          value={value !== undefined ? value : ''}
          onChange={this.handleChange}
        />
        <FormHelperText>{errorMessage}</FormHelperText>
      </FormControl>
    )
  }
}

TextField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  info: PropTypes.string,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes
}

export default compose(
  withFormContext,
  withInfoTooltip,
  withStyles(styles),
)(TextField)
