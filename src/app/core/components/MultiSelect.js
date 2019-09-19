import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { makeStyles, createStyles } from '@material-ui/styles'
import Box from '@material-ui/core/Box'
import FormControl from '@material-ui/core/FormControl'
import InputAdornment from '@material-ui/core/InputAdornment'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import SearchIcon from '@material-ui/icons/Search'
import * as Fuse from 'fuse.js'

const FUSE_OPTIONS = {
  keys: ['value', 'label'],
}

const useStyles = makeStyles(theme => createStyles({
  container: {
    display: 'inline-flex',
    flexDirection: 'column',
    padding: 10,
    border: '1px solid #000',
  },
  option: {

  },
}))

const MultiSelect = ({ label, options, values, onChange, maxOptions, sortSelectedFirst }) => {
  const classes = useStyles()

  const adjustOptions = (options) => {
    const sortBySelected = (a, b) => values.includes(b.value) - values.includes(a.value)
    const sortedOptions = sortSelectedFirst ? options.sort(sortBySelected) : options
    const limitedOptions = maxOptions ? sortedOptions.slice(0, maxOptions) : sortedOptions

    return limitedOptions
  }

  const [visibleOptions, setVisibleOptions] = useState(adjustOptions(options))
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
      setVisibleOptions(adjustOptions(options))
    } else if (fuse) {
      const searchResults = fuse.search(term)
      setVisibleOptions(adjustOptions(searchResults))
    }
  }

  const onHitEnter = () => {
    if (visibleOptions.length === 1) {
      toggleOption(visibleOptions[0].value)
    }
  }

  return (
    <Box className={classes.container}>
      <SearchField onSearchChange={onSearchChange} onHitEnter={onHitEnter} />
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
  )
}

const SearchField = ({ onSearchChange, onHitEnter }) => {
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
    <FormControl>
      <OutlinedInput
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        startAdornment={<InputAdornment position="start"><SearchIcon /></InputAdornment>}
      />
    </FormControl>
  )
}

const Option = ({ classes, label, ...checkboxProps }) =>
  <FormControlLabel
    className={classes.options}
    label={label}
    control={<Checkbox {...checkboxProps} />}
  />

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
