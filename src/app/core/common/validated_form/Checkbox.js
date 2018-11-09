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

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit
  }
})

@withFormContext
@withStyles(styles)
export default class Checkbox extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    info: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func,
    ...ValidatedFormInputPropTypes,
  }

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
