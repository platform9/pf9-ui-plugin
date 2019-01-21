import React from 'react'
import PropTypes from 'prop-types'
import Picklist from 'core/components/Picklist'
import {
  FormControl,
  FormHelperText,
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

/**
 * PicklistField builds upon Picklist and adds integration with ValidatedForm
 */
@withFormContext
class PicklistField extends React.Component {
  handleChange = value => {
    const { onChange } = this.props
    if (onChange) {
      onChange(value)
    }
  }

  render () {
    const { id, label, value, showNone, classes, hasError, errorMessage, ...restProps } = this.props
    const options = showNone ? [{ value: '', label: 'None' }, ...this.props.options] : this.props.options
    return (
      <FormControl id={id} className={classes.formControl} error={hasError}>
        <Picklist
          {...restProps}
          name={id}
          label={label}
          options={options}
          value={value !== undefined ? value: ''}
          onChange={this.handleChange}
        />
        <FormHelperText>{errorMessage}</FormHelperText>
      </FormControl>
    )
  }
}

PicklistField.defaultProps = {
  validations: [],
}

const optionPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
  })
])

PicklistField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.arrayOf(optionPropType).isRequired,
  initialValue: PropTypes.string,

  /** Create an option of 'None' as the first default choice */
  showNone: PropTypes.bool,
  ...ValidatedFormInputPropTypes,
}

export default compose(
  withFormContext,
  withInfoTooltip,
  withStyles(styles),
)(PicklistField)
