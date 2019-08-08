import React from 'react'
import PropTypes from 'prop-types'
import Picklist from 'core/components/Picklist'
import InfoTooltip from 'app/core/components/InfoTooltip'
import { compose } from 'app/utils/fp'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'

/**
 * PicklistField builds upon Picklist and adds integration with ValidatedForm
 */
const PicklistField = React.forwardRef(({ id, info, placement, onChange, label, value, showNone, classes, hasError, errorMessage, title, options, className, ...restProps },
  ref) => {
  const [open, setOpen] = React.useState(false)
  const openTooltip = () => setOpen(true)
  const closeTooltip = () => setOpen(false)

  return <InfoTooltip open={open} info={info} placement={placement}>
    <Picklist
      {...restProps}
      onMouseEnter={openTooltip}
      onMouseLeave={closeTooltip}
      onFocus={openTooltip}
      onBlur={closeTooltip}
      onClick={closeTooltip}
      ref={ref}
      title={title}
      className={className}
      id={id}
      name={id}
      label={label}
      options={showNone ? [{ value: '', label: 'None' }, ...options] : options}
      value={value !== undefined ? value : ''}
      onChange={onChange}
      error={hasError}
      helperText={errorMessage}
    />
  </InfoTooltip>
})

PicklistField.defaultProps = {
  validations: [],
}

const numOrString = PropTypes.oneOfType([PropTypes.number, PropTypes.string])
const optionPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
  PropTypes.shape({
    value: numOrString,
    label: numOrString,
  }),
])

PicklistField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.arrayOf(optionPropType).isRequired,
  initialValue: numOrString,
  onChange: PropTypes.func,
  info: PropTypes.string,
  placement: PropTypes.string,

  /** Create an option of 'None' as the first default choice */
  showNone: PropTypes.bool,
  ...ValidatedFormInputPropTypes,
}

export default compose(
  withFormContext,
)(PicklistField)
