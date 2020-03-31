import React, { useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles } from '@material-ui/styles'
import TextField from '@material-ui/core/TextField'
import { prepend, identity, pipe, map, isEmpty } from 'ramda'
import Progress from 'core/components/progress/Progress'
import { allKey, noneKey } from 'app/constants'
import { isNilOrEmpty, emptyArr, ensureArray } from 'utils/fp'

/**
 * Picklist is a bare-bones widget-only implmentation.
 * See PicklistField if you need ValidatedForm integration.
 */
const useStyles = makeStyles((theme) => ({
  root: {
    display: ({ formField }) => (formField ? 'flex' : 'block'),
    flexWrap: 'wrap',
    minWidth: 120,
    marginTop: theme.spacing(1),
  },
}))

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const Picklist = React.forwardRef((props, ref) => {
  const {
    disabled,
    showAll,
    showNone,
    noneLabel,
    label,
    name,
    value,
    options,
    onChange,
    loading,
    formField,
    multiple = false,
    ...restProps
  } = props
  const classes = useStyles(props)
  const inputProps = useMemo(() => ({ name: label, id: name }), [label, name])
  const items = useMemo(
    () =>
      pipe(
        map((option) => (typeof option === 'string' ? { value: option, label: option } : option)),
        map((option) => ({
          label: option.label,
          // Hack to work around Material UI's Select ignoring empty string as a value
          value: option.value === '' ? noneKey : option.value,
        })),
        showNone ? prepend({ label: noneLabel || 'None', value: noneKey }) : identity,
        showAll ? prepend({ label: 'All', value: allKey }) : identity,
        map((option) => (
          <MenuItem data-test-id="pick-list-menu-item" value={option.value} key={option.value}>
            {option.label}
          </MenuItem>
        )),
      )(options),
    [options],
  )
  const selectProps = useMemo(() => ({ displayEmpty: true, multiple }), [])
  const handleChange = useCallback(
    (e) => {
      // Hack to work around the fact that Material UI's "Select" will ignore
      // an options with value of '' (empty string).
      const value = e.target.value === noneKey ? '' : e.target.value
      onChange && onChange(multiple ? ensureArray(value) : value)
    },
    [onChange],
  )

  // Hack to work around Material UI's Select ignoring empty string as a value
  const nonEmptyValue = isNilOrEmpty(value)
    ? showNone
      ? noneKey
      : showAll
      ? allKey
      : value
    : value

  // If loading is undefined, it means we are not performing any async
  // operation to load the options, hence we can render the contents on mount
  return (
    <Progress inline overlay loading={loading} renderContentOnMount={loading === undefined}>
      <TextField
        data-test-id="pick-list-text-field"
        {...restProps}
        ref={ref}
        disabled={disabled || (isEmpty(options) && !showNone)}
        select
        classes={classes}
        label={label}
        value={nonEmptyValue || (multiple ? emptyArr : '')}
        SelectProps={selectProps}
        onChange={handleChange}
        inputProps={inputProps}
      >
        {items}
      </TextField>
    </Progress>
  )
})

const valuePropType = PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.array])
const optionPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
  PropTypes.shape({
    value: valuePropType,
    label: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
])

Picklist.propTypes = {
  formField: PropTypes.bool,
  label: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  name: PropTypes.string.isRequired,
  noneLabel: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(optionPropType),
  showAll: PropTypes.bool,
  showNone: PropTypes.bool,
  value: valuePropType,
  variant: PropTypes.string,
  multiple: PropTypes.bool,
}

Picklist.defaultProps = {
  formField: false,
  options: [],
  showAll: true,
  showNone: false,
  value: '',
  variant: 'outlined',
  multiple: false,
}

export default Picklist
