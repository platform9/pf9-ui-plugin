import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import Picklist from 'core/components/Picklist'
import { withInfoTooltip } from 'core/components/InfoTooltip'
import withFormContext, {
  ValidatedFormInputPropTypes,
} from 'core/components/validatedForm/withFormContext'
import { compose } from 'utils/fp'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(() => ({
  // Workaround for label value in outlined TextField overlapping the border
  // https://github.com/mui-org/material-ui/issues/14530
  label: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: '0 5px',
    margin: '0 -5px',
  },
}))

/**
 * PicklistField builds upon Picklist and adds integration with ValidatedForm
 */
// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const PicklistField = React.forwardRef(
  (
    {
      DropdownComponent,
      id,
      info,
      placement,
      label,
      required,
      value,
      showNone,
      updateFieldValue,
      getCurrentValue,
      hasError,
      errorMessage,
      options,
      ...restProps
    },
    ref,
  ) => {
    const classes = useStyles()

    return (
      <DropdownComponent
        {...restProps}
        InputLabelProps={{
          classes: {
            root: classes.label,
          },
        }}
        formField
        label={required ? `${label} *` : label}
        ref={ref}
        id={id}
        name={id}
        options={options}
        value={value !== undefined ? value : ''}
        error={hasError}
        helperText={errorMessage}
        showNone={showNone}
      />
    )
  },
)

PicklistField.defaultProps = {
  validations: [],
  DropdownComponent: Picklist,
  showNone: false,
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
  showNone: PropTypes.bool,
  showAll: PropTypes.bool,
  ...ValidatedFormInputPropTypes,
}

export default compose(withInfoTooltip, withFormContext)(PicklistField)
