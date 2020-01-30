import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { makeStyles, createStyles } from '@material-ui/styles'
import Box from '@material-ui/core/Box'
import FormControl from '@material-ui/core/FormControl'
import InputAdornment from '@material-ui/core/InputAdornment'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import SearchIcon from '@material-ui/icons/Search'
import * as Fuse from 'fuse.js'
import { Typography, FormHelperText } from '@material-ui/core'
import { emptyArr } from 'utils/fp'

const FUSE_OPTIONS = {
  keys: ['value', 'label'],
}

const useStyles = makeStyles(theme => createStyles({
  container: {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'column',
    padding: theme.spacing(2, 1, 1, 1),
    borderRadius: 4,
    border: `1px solid ${theme.palette.grey[400]}`,
    maxHeight: '350px',
  },
  label: {
    position: 'absolute',
    top: -12,
    backgroundColor: 'white',
    padding: 4,
  },
  searchInputWrapper: {
    marginBottom: 4,
  },
  notchedOutline: {
    borderRadius: 0,
  },
  input: {
    boxSizing: 'border-box',
    height: 28,
    padding: 6,
    fontSize: 13,
  },
  adornedStart: {
    paddingLeft: 8,
  },
  searchIcon: {
    color: '#BABABA',
  },
  positionStart: {
    marginRight: 0,
  },
  formControlLabelRoot: {
    marginLeft: -6,
    margin: '2px 0',
  },
  checkbox: {
    padding: 4,
  },
  checkboxSize: {
    fontSize: 16,
  },
  options: {
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  optionLabel: {
    fontSize: 13,
  },
}))

const MultiSelect = React.forwardRef(
  ({
    id, label, hasError, required, errorMessage,
    options, values = emptyArr, onChange, maxOptions, sortSelectedFirst,
  }, ref) => {
    const classes = useStyles()

    const [term, setTerm] = useState('')
    const fuse = useMemo(() => new Fuse(options, FUSE_OPTIONS), [options])

    // Change visibleOptions when we receive async changes to options.
    // `options` is originally `[]` during most async data loading.
    const sortedOptions = useMemo(() => {
      const visibleOptions = term ? fuse.search(term) : options
      const sortBySelected = (a, b) => values.includes(b.value) - values.includes(a.value)
      return sortSelectedFirst ? visibleOptions.sort(sortBySelected) : visibleOptions
    }, [term, fuse, values, sortSelectedFirst])

    const toggleOption = (value) => {
      const updatedValues = values.includes(value)
        ? values.filter(currentValue => currentValue !== value)
        : [...values, value]

      onChange(updatedValues)
    }

    const onHitEnter = () => {
      if (sortedOptions.length === 1) {
        toggleOption(sortedOptions[0].value)
      }
    }

    return (
      <FormControl className={classes.container} id={id} error={hasError} ref={ref}>
        <Typography className={classes.label} variant="caption">{required
          ? `${label} *`
          : label}</Typography>
        <SearchField classes={classes} term={term} onSearchChange={setTerm} onHitEnter={onHitEnter} />
        <Box
          className={classes.options}
          style={{ height: maxOptions ? getOptionsHeight(maxOptions) : 'initial' }}
        >
          {sortedOptions.map((option) => (
            <Option
              classes={classes}
              key={option.value}
              label={option.label}
              value={option.value}
              checked={values.includes(option.value)}
              onChange={() => toggleOption(option.value)}
            />
          ))}
        </Box>
        {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
      </FormControl>
    )
  })

const SearchField = ({ classes, term, onSearchChange, onHitEnter }) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onHitEnter()
    } else if (event.key === 'Escape') {
      onSearchChange('')
    }
  }

  return (
    <FormControl className={classes.searchInputWrapper}>
      <OutlinedInput
        value={term}
        onChange={e => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        startAdornment={
          <InputAdornment position="start" classes={{ positionStart: classes.positionStart }}>
            <SearchIcon className={classes.searchIcon} />
          </InputAdornment>
        }
        classes={{
          notchedOutline: classes.notchedOutline,
          input: classes.input,
          adornedStart: classes.adornedStart,
        }}
      />
    </FormControl>
  )
}

const Option = ({ classes, label, ...checkboxProps }) =>
  <FormControlLabel
    label={label}
    control={
      <Checkbox
        color="primary"
        className={classes.checkbox}
        icon={<CheckBoxOutlineBlankIcon className={classes.checkboxSize} />}
        checkedIcon={<CheckBoxIcon className={classes.checkboxSize} />}
        {...checkboxProps}
      />
    }
    classes={{ root: classes.formControlLabelRoot, label: classes.optionLabel }}
  />

const getOptionsHeight = (maxOptions) => maxOptions * 28

const optionPropType = PropTypes.shape({
  value: PropTypes.string,
  label: PropTypes.string,
})

MultiSelect.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(optionPropType).isRequired,
  values: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  maxOptions: PropTypes.number,
  sortSelectedFirst: PropTypes.bool,
}

export default MultiSelect
