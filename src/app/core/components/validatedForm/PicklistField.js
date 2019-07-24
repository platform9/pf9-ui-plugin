import React from 'react'
import PropTypes from 'prop-types'
import Picklist from 'core/components/Picklist'
import { FormHelperText, FormControl } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { withInfoTooltip } from 'app/core/components/InfoTooltip'
import { compose } from 'app/utils/fp'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'

const styles = theme => ({
  root: {
    margin: 0,
  },
})

/**
 * PicklistField builds upon Picklist and adds integration with ValidatedForm
 */
class PicklistField extends React.Component {
  handleChange = value => {
    const { onChange } = this.props
    if (onChange) {
      onChange(value)
    }
  }

  render () {
    const { id, label, value, showNone, classes, hasError, errorMessage, title, options, className, ...restProps } = this.props
    return (
      <FormControl id={id} className={classes.root} error={hasError} {...restProps}>
        <Picklist
          title={title}
          className={className}
          name={id}
          label={label}
          options={showNone ? [{ value: '', label: 'None' }, ...options] : options}
          value={value !== undefined ? value : ''}
          onChange={this.handleChange}
        />
        {errorMessage && <FormHelperText error={hasError}>{errorMessage}</FormHelperText>}
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
  }),
])

PicklistField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.arrayOf(optionPropType).isRequired,
  initialValue: PropTypes.string,
  onChange: PropTypes.func,

  /** Create an option of 'None' as the first default choice */
  showNone: PropTypes.bool,
  ...ValidatedFormInputPropTypes,
}

export default compose(
  withFormContext,
  withStyles(styles),
  withInfoTooltip,
)(PicklistField)
