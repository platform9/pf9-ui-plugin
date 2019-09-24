import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import Picklist from 'core/components/Picklist'
import InfoTooltip from 'app/core/components/InfoTooltip'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import { compose } from 'utils/fp'

/**
 * PicklistField builds upon Picklist and adds integration with ValidatedForm
 */
// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const PicklistField = React.forwardRef(({
  DropdownComponent, id, info, placement, label, value, showNone,
  hasError, errorMessage, options, ...restProps
}, ref) => {
  const [open, setOpen] = React.useState(false)
  const openTooltip = useCallback(() => setOpen(true), [])
  const closeTooltip = useCallback(() => setOpen(false), [])

  return <InfoTooltip open={open} info={info} placement={placement}>
    <DropdownComponent
      {...restProps}
      formField
      onMouseEnter={openTooltip}
      onMouseLeave={closeTooltip}
      onFocus={openTooltip}
      onBlur={closeTooltip}
      onClick={closeTooltip}
      ref={ref}
      id={id}
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
  showNone: true,
  showAll: false,
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
  options: PropTypes.arrayOf(optionPropType),
  initialValue: numOrString,
  onChange: PropTypes.func,
  info: PropTypes.string,
  placement: PropTypes.string,
  showNone: PropTypes.bool,
  showAll: PropTypes.bool,
  ...ValidatedFormInputPropTypes,
}

export default compose(
  withFormContext,
)(PicklistField)
