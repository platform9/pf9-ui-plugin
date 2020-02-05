import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Checkbox from 'core/components/Checkbox'
import { FormControl, FormControlLabel, FormHelperText } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { withInfoTooltip } from 'app/core/components/InfoTooltip'
import { compose } from 'app/utils/fp'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'

const styles = (theme) => ({
  formControl: {
    marginTop: theme.spacing(1),
  },
})

class CheckboxField extends PureComponent {
  handleChange = (e) => {
    const { onChange } = this.props
    if (onChange) {
      onChange(e.target.checked)
    }
  }

  render() {
    const {
      id,
      label,
      classes,
      required,
      value,
      getCurrentValue,
      updateFieldValue,
      hasError,
      errorMessage,
      onClick,
      onChange,
      onMouseEnter,
      ...restProps
    } = this.props

    return (
      <div {...restProps}>
        <FormControl
          id={id}
          onMouseEnter={onMouseEnter}
          className={classes.formControl}
          error={hasError}
        >
          <FormControlLabel
            label={required ? `${label} *` : label}
            control={
              <Checkbox
                {...restProps}
                onClick={onClick}
                error={errorMessage}
                checked={!!value}
                onChange={this.handleChange}
              />
            }
          />
          {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
        </FormControl>
      </div>
    )
  }
}

CheckboxField.propTypes = {
  id: PropTypes.string.isRequired,
  info: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}

export default compose(
  withInfoTooltip, // This HoC causes unnecessary re-renders if declared after withFormContext
  withStyles(styles),
  withFormContext,
)(CheckboxField)
