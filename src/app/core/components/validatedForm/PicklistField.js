import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import Picklist from 'core/components/Picklist'
import InfoTooltip from 'app/core/components/InfoTooltip'
import { compose } from 'app/utils/fp'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'

/**
 * PicklistField builds upon Picklist and adds integration with ValidatedForm
 */
const PicklistField = React.forwardRef(({ DropdownComponent, id, info, placement, label, value, showNone, classes, hasError, errorMessage, options, ...restProps },
  ref) => {
  const [open, setOpen] = React.useState(false)
  const openTooltip = useCallback(() => setOpen(true), [])
  const closeTooltip = useCallback(() => setOpen(false), [])

  return <InfoTooltip open={open} info={info} placement={placement}>
    <DropdownComponent
      {...restProps}
      onMouseEnter={openTooltip}
      onMouseLeave={closeTooltip}
      onFocus={openTooltip}
      onBlur={closeTooltip}
      onClick={closeTooltip}
      ref={ref}
      id={id}
      disabled={!options || !options.length}
      name={id}
      label={label}
      options={options}
      value={value !== undefined ? value : ''}
      error={hasError}
      helperText={errorMessage}
    />
  </InfoTooltip>
})

PicklistField.defaultProps = {
  validations: [],
  DropdownComponent: Picklist,
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
  DropdownComponent: PropTypes.elementType,
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.arrayOf(optionPropType).isRequired,
  initialValue: numOrString,
  onChange: PropTypes.func,
  info: PropTypes.string,
  placement: PropTypes.string,
  ...ValidatedFormInputPropTypes,
}

export default compose(
  withFormContext,
)(PicklistField)
