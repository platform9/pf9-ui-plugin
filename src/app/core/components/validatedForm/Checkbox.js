import React from 'react'
import PropTypes from 'prop-types'
import {
  Checkbox as BaseCheckbox, FormControl, FormControlLabel, FormHelperText
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { withInfoTooltip } from 'app/core/components/InfoTooltip'
import { compose } from 'app/utils/fp'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'

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
      <div {...restProps}>
        <FormControl id={id} onMouseEnter={onMouseEnter} className={classes.formControl} error={hasError}>
          <FormControlLabel
            label={label}
            control={<div>
              <BaseCheckbox
                {...restProps}
                error={errorMessage}
                checked={!!value}
                onChange={this.handleChange}
              /></div>
            }
          />
          <FormHelperText>{errorMessage}</FormHelperText>
        </FormControl>
      </div>
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
  withInfoTooltip,
  withStyles(styles),
)(Checkbox)
