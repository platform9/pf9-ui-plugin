import React, { useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles } from '@material-ui/styles'
import TextField from '@material-ui/core/TextField'
import { pipe, map } from 'ramda'
import Progress from 'core/components/progress/Progress'

/**
 * Picklist is a bare-bones widget-only implmentation.
 * See PicklistField if you need ValidatedForm integration.
 */
const useStyles = makeStyles(theme => ({
  root: {
    display: ({ formField }) =>
      formField ? 'flex' : 'block',
    flexWrap: 'wrap',
    minWidth: 120,
    marginTop: theme.spacing(1),
  },
}))

const Picklist = ({ className, label, name, value, options, onChange, formField, loading, ...restProps }) => {
  const classes = useStyles()
  const handleChange = useCallback(e => {
    // Hack to work around the fact that Material UI's "Select" will ignore
    // an options with value of '' (empty string).
    const value = e.target.value === '__none__' ? '' : e.target.value
    onChange && onChange(value)
  }, [onChange])

  const items = useMemo(() => map(pipe(
    option => typeof option === 'string' ? ({ value: option, label: option }) : option,
    option => ({
      label: option.label,
      // Hack to work around Material UI's Select ignoring empty string as a value
      value: option.value === '' ? '__none__' : option.value,
    }),
    option => <MenuItem value={option.value} key={option.value}>{option.label}</MenuItem>,
  ), options), [options])

  // Hack to work around Material UI's Select ignoring empty string as a value
  const nonEmptyValue = value === '' ? '__none__' : value

  return <Progress inline overlay loading={loading}>
    <TextField
      {...restProps}
      select
      className={className}
      classes={classes}
      variant="outlined"
      label={label}
      value={nonEmptyValue}
      SelectProps={{ displayEmpty: true }}
      onChange={handleChange}
      inputProps={{ name: label, id: name }}
    >
      {items}
    </TextField>
  </Progress>
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

Picklist.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(optionPropType).isRequired,
  value: numOrString,
  onChange: PropTypes.func,
  formField: PropTypes.bool,
  loading: PropTypes.bool,
}

Picklist.defaultProps = {
  formField: true,
  loading: false,
}

export default Picklist
