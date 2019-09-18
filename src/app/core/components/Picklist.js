import React, { useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles } from '@material-ui/styles'
import TextField from '@material-ui/core/TextField'
import { prepend, identity, pipe, map, isEmpty } from 'ramda'
import Progress from 'core/components/progress/Progress'
import { allKey, noneKey } from 'app/constants'

/**
 * Picklist is a bare-bones widget-only implmentation.
 * See PicklistField if you need ValidatedForm integration.
 */
const useStyles = makeStyles(theme => ({
  root: {
    display: ({ formField }) => formField ? 'flex' : 'block',
    flexWrap: 'wrap',
    minWidth: 120,
    marginTop: theme.spacing(1),
  },
}))
const selectProps = { displayEmpty: true }

const Picklist = React.forwardRef((props, ref) => {
  const {
    disabled, notAsync, showAll, showNone, label, name, value, options, onChange, loading, formField, ...restProps
  } = props
  const classes = useStyles(props)
  const inputProps = useMemo(() => ({ name: label, id: name }), [label, name])
  const items = useMemo(() => pipe(
    map(option => typeof option === 'string' ? ({ value: option, label: option }) : option),
    map(option => ({
      label: option.label,
      // Hack to work around Material UI's Select ignoring empty string as a value
      value: option.value === '' ? noneKey : option.value,
    })),
    showAll ? prepend({ label: 'All', value: allKey }) : identity,
    showNone ? prepend({ label: 'None', value: noneKey }) : identity,
    map(option => <MenuItem value={option.value} key={option.value}>{option.label}</MenuItem>),
  )(options), [options])

  const handleChange = useCallback(e => {
    // Hack to work around the fact that Material UI's "Select" will ignore
    // an options with value of '' (empty string).
    const value = e.target.value === noneKey ? '' : e.target.value
    onChange && onChange(value)
  }, [onChange])

  // Hack to work around Material UI's Select ignoring empty string as a value
  const nonEmptyValue = value === ''
    ? (showNone
      ? noneKey
      : (showAll ? allKey : value))
    : value

  return <Progress inline overlay loading={loading} renderContentOnMount={notAsync}>
    <TextField
      {...restProps}
      ref={ref}
      disabled={disabled || (isEmpty(options) && !showNone)}
      select
      classes={classes}
      label={label}
      value={nonEmptyValue}
      SelectProps={selectProps}
      onChange={handleChange}
      inputProps={inputProps}
    >
      {items}
    </TextField>
  </Progress>
})

const numOrString = PropTypes.oneOfType([PropTypes.number, PropTypes.string])
const optionPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
  PropTypes.shape({
    value: numOrString,
    label: numOrString,
  }),
])

Picklist.propTypes = {
  notAsync: PropTypes.bool,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(optionPropType),
  value: numOrString,
  onChange: PropTypes.func,
  formField: PropTypes.bool,
  loading: PropTypes.bool,
  showAll: PropTypes.bool,
  showNone: PropTypes.bool,
  variant: PropTypes.string,
}

Picklist.defaultProps = {
  notAsync: false,
  showAll: true,
  showNone: false,
  formField: false,
  variant: 'outlined',
  value: '',
  options: [],
}

export default Picklist
