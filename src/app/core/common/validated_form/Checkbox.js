import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import {
  Checkbox as BaseCheckbox,
  FormControl,
  FormControlLabel,
  FormHelperText
} from '@material-ui/core'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/common/validated_form/withFormContext'
import { compose } from 'core/fp'

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit
  }
})

class Checkbox extends React.Component {
  handleChange = e => {
    const { onChange } = this.props
    if (onChange) {
      onChange(e.target.checked)
    }
  }

  render () {
    const { id, label, value, classes, hasError, onMouseEnter, errorMessage, ...restProps } = this.props
    return (
      <FormControl id={id} className={classes.formControl} error={hasError}>
        <FormControlLabel
          label={label}
          onMouseEnter={onMouseEnter}
          control={
            <BaseCheckbox
              {...restProps}
              error={errorMessage}
              checked={value}
              onChange={this.handleChange}
            />
          }
        />
        <FormHelperText>{errorMessage}</FormHelperText>
      </FormControl>
    )
  }
}

Checkbox.propTypes = {
  id: PropTypes.string.isRequired,
  info: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}

export default compose(
  withFormContext,
  withStyles(styles),
)(Checkbox)
