import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import Picklist from 'core/components/Picklist'
import InfoTooltip from 'app/core/components/InfoTooltip'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import { compose } from 'utils/fp'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(() => ({
  // Workaround for label value in outlined TextField overlapping the border
  // https://github.com/mui-org/material-ui/issues/14530
  label: {
    backgroundColor: 'white',
    padding: '0 5px',
    margin: '0 -5px',
  },
}))

/**
 * PicklistField builds upon Picklist and adds integration with ValidatedForm
 */
// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const PicklistField = React.forwardRef(({
  DropdownComponent, id, info, placement, label, required, value, showNone,
  hasError, errorMessage, options, ...restProps
}, ref) => {
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)
  const openTooltip = useCallback(() => setOpen(true), [])
  const closeTooltip = useCallback(() => setOpen(false), [])

  return (
    <InfoTooltip open={open} info={info} placement={placement}>
      <DropdownComponent
        {...restProps}
        InputLabelProps={{
          classes: {
            root: classes.label,
          },
        }}
        formField
        label={required ? `${label} *` : label}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        onFocus={openTooltip}
        onBlur={closeTooltip}
        onClick={closeTooltip}
        ref={ref}
        id={id}
        name={id}
        options={options}
        value={value !== undefined ? value : ''}
        error={hasError}
        helperText={errorMessage}
      />
    </InfoTooltip>
  )
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
