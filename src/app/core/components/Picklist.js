import React, { useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles } from '@material-ui/styles'
import TextField from '@material-ui/core/TextField'
import { prepend, identity, pipe, map, isEmpty } from 'ramda'
import Progress from 'core/components/progress/Progress'
import { allKey, noneKey } from 'app/constants'
import { isNilOrEmpty, emptyArr, ensureArray } from 'utils/fp'
import FontAwesomeIcon from './FontAwesomeIcon'

/**
 * Picklist is a bare-bones widget-only implmentation.
 * See PicklistField if you need ValidatedForm integration.
 */
const useStyles = makeStyles((theme) => ({
  root: {
    display: ({ formField, inline }) => (formField ? 'flex' : inline ? 'inline-block' : 'block'),
    flexWrap: 'wrap',
    minWidth: 120,
    marginTop: theme.spacing(1),
  },
  list: {
    maxHeight: 400,
  },
  addNewItemOption: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gridGap: theme.spacing(1),
    margin: theme.spacing(0, 1, 0, 1),
    borderTop: `0.97px solid ${theme.palette.grey[300]}`,
    borderBottom: `0.97px solid ${theme.palette.grey[300]}`,
    '& > i': {
      color: theme.palette.blue[500],
    },
  },
}))

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const Picklist = React.forwardRef((props, ref) => {
  const {
    disabled,
    showAll,
    showNone,
    noneLabel,
    allLabel = 'All',
    name,
    label,
    value,
    options,
    onChange,
    loading,
    formField,
    inline,
    multiple = false,
    addNewItemOption,
    addNewItemOptionLabel,
    addNewItemHandler,
    ...restProps
  } = props
  const classes = useStyles(props)
  const inputProps = useMemo(() => ({ name: label || name, id: name }), [label, name])
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
        showAll ? prepend({ label: allLabel, value: allKey }) : identity,
        map((option) => (
          <MenuItem value={option.value} key={option.label}>
            {option.label}
          </MenuItem>
        )),
      )(options),
    [options],
  )
  const selectProps = useMemo(
    () => ({ displayEmpty: true, multiple, MenuProps: { classes: { list: classes.list } } }),
    [],
  )
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

  // When loading we want to remove the visual elements inside the borders as
  // the loading content will be populated there
  const loadingProps = loading
    ? {
        placeholder: '',
        label: '',
        value: '',
      }
    : {}
  return (
    <Progress inline={inline} overlay loading={loading} renderContentOnMount message="Loading">
      <TextField
        {...restProps}
        ref={ref}
        disabled={disabled || (isEmpty(options) && !showNone && !addNewItemOption)}
        select
        classes={{ root: classes.root }}
        label={label}
        value={nonEmptyValue || (multiple ? emptyArr : '')}
        {...loadingProps}
        SelectProps={selectProps}
        onChange={handleChange}
        inputProps={inputProps}
      >
        {addNewItemOption && (
          <MenuItem
            onClick={addNewItemHandler}
            className={classes.addNewItemOption}
            value={noneKey}
            key="addNewItemOption"
          >
            <FontAwesomeIcon solid size="sm" className={classes.plusIcon}>
              plus-circle
            </FontAwesomeIcon>
            {addNewItemOptionLabel}
          </MenuItem>
        )}
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
  label: PropTypes.string,
  loading: PropTypes.bool,
  name: PropTypes.string.isRequired,
  noneLabel: PropTypes.string,
  allLabel: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(optionPropType),
  showAll: PropTypes.bool,
  showNone: PropTypes.bool,
  value: valuePropType,
  variant: PropTypes.string,
  multiple: PropTypes.bool,
  inline: PropTypes.bool,
  addNewItemOption: PropTypes.bool,
  addNewItemOptionLabel: PropTypes.string,
  addNewItemHandler: PropTypes.func,
}

Picklist.defaultProps = {
  formField: false,
  options: [],
  showAll: true,
  showNone: false,
  value: '',
  variant: 'outlined',
  multiple: false,
  inline: true,
  addNewItemOption: false,
}

export default Picklist
