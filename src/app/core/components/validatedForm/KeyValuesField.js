import React from 'react'
import PropTypes from 'prop-types'
import { withInfoTooltip } from 'app/core/components/InfoTooltip'
import { Typography, FormControl, FormHelperText } from '@material-ui/core'
import { compose } from 'app/utils/fp'
import KeyValues, { EntryShape } from 'core/components/KeyValues'
import withFormContext from 'core/components/validatedForm/withFormContext'

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const KeyValuesField = React.forwardRef(
  (
    {
      id,
      value,
      getCurrentValue,
      required,
      label,
      hasError,
      updateFieldValue,
      errorMessage,
      onChange,
      keySuggestions,
      valueSuggestions,
      blacklistedTags,
      ...restProps
    },
    ref,
  ) => (
    <FormControl id={id} error={hasError} {...restProps} ref={ref}>
      <Typography variant="caption">{required ? `${label} *` : label}</Typography>
      <KeyValues
        entries={value !== undefined ? value : []}
        onChange={onChange}
        keySuggestions={keySuggestions}
        valueSuggestions={valueSuggestions}
        blacklistedTags={blacklistedTags}
      />
      {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  ),
)

KeyValuesField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func,
  initialValue: PropTypes.arrayOf(EntryShape),
  blacklistedTags: PropTypes.arrayOf(PropTypes.string),
}

export default compose(
  withInfoTooltip, // This HoC causes unnecessary re-renders if declared after withFormContext
  withFormContext,
)(KeyValuesField)
