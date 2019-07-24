import React from 'react'
import PropTypes from 'prop-types'
import {
  Checkbox as BaseCheckbox, FormControl, FormControlLabel, FormHelperText,
} from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { withInfoTooltip } from 'app/core/components/InfoTooltip'
import { compose } from 'app/utils/fp'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'

const styles = theme => ({
  formControl: {
    marginTop: theme.spacing(1),
  }
})

class CheckboxField extends React.Component {
  handleChange = e => {
    const { onChange } = this.props
    if (onChange) {
      onChange(e.target.checked)
    }
  }

  render () {
    const { id, label, value, classes, hasError, onClick, onChange, onMouseEnter, errorMessage, ...restProps } = this.props

    return (
      <div {...restProps}>
        <FormControl id={id} onMouseEnter={onMouseEnter} className={classes.formControl} error={hasError}>
          <FormControlLabel
            label={label}
            control={<div>
              <BaseCheckbox
                {...restProps}
                onClick={onClick}
                error={errorMessage}
                checked={!!value}
                onChange={this.handleChange}
              /></div>
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
  withFormContext,
  withStyles(styles),
  withInfoTooltip,
)(CheckboxField)
