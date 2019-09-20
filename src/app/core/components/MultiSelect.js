import React, { useState, useEffect } from 'react'
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

const FUSE_OPTIONS = {
  keys: ['value', 'label'],
}

const useStyles = makeStyles(theme => createStyles({
  container: {
    display: 'inline-flex',
    flexDirection: 'column',
    padding: 8,
    border: `1px solid ${theme.palette.common.black}`,
  },
  searchInputWrapper: {
    marginBottom: 4,
  },
  notchedOutline: {
    borderRadius: 0,
  },
  input: {
    boxSizing: 'border-box',
    height: 30,
    padding: 6,
    fontSize: 13,
  },
  adornedStart: {
    paddingLeft: 8,
  },
  searchIcon: {
    color: '#bababa',
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

const MultiSelect = ({ label, options, values, onChange, maxOptions, sortSelectedFirst }) => {
  const classes = useStyles()

  const sortOptions = (options) => {
    const sortBySelected = (a, b) => values.includes(b.value) - values.includes(a.value)
    const sortedOptions = sortSelectedFirst ? options.sort(sortBySelected) : options

    return sortedOptions
  }

  const [visibleOptions, setVisibleOptions] = useState(sortOptions(options))
  const [fuse, setFuse] = useState(null)

  useEffect(() => setFuse(new Fuse(options, FUSE_OPTIONS)), [options])

  const toggleOption = (value) => {
    const updatedValues = values.includes(value)
      ? values.filter(currentValue => currentValue !== value)
      : [...values, value]

    onChange(updatedValues)
  }

  const onSearchChange = (term) => {
    if (!term) {
      setVisibleOptions(sortOptions(options))
    } else if (fuse) {
      const searchResults = fuse.search(term)
      setVisibleOptions(sortOptions(searchResults))
    }
  }

  const onHitEnter = () => {
    if (visibleOptions.length === 1) {
      toggleOption(visibleOptions[0].value)
    }
  }

  return (
    <Box className={classes.container}>
      <SearchField classes={classes} onSearchChange={onSearchChange} onHitEnter={onHitEnter} />
      <Box
        className={classes.options}
        style={{ height: maxOptions ? getOptionsHeight(maxOptions) : 'initial' }}
      >
        {visibleOptions.map((option) => (
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
    </Box>
  )
}

const SearchField = ({ classes, onSearchChange, onHitEnter }) => {
  const [term, setTerm] = useState('')

  useEffect(() => onSearchChange(term), [term])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onHitEnter()
    } else if (event.key === 'Escape') {
      setTerm('')
    }
  }

  return (
    <FormControl className={classes.searchInputWrapper}>
      <OutlinedInput
        value={term}
        onChange={(e) => setTerm(e.target.value)}
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
