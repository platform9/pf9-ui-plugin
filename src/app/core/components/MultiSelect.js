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

const MultiSelect = ({ label, options, values, onChange, maxOptions }) => {
  const classes = useStyles()
  const limitOptions = (options) => maxOptions ? options.slice(0, maxOptions) : options

  const [visibleOptions, setVisibleOptions] = useState(limitOptions(options))
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
      setVisibleOptions(limitOptions(options))
    } else if (fuse) {
      const searchResults = fuse.search(term)
      setVisibleOptions(limitOptions(searchResults))
    }
  }

  return (
    <Box className={classes.container}>
      <SearchField onSearchChange={onSearchChange} />
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

const SearchField = ({ onSearchChange }) => {
  const [term, setTerm] = useState('')

  useEffect(() => onSearchChange(term), [term])

  return (
    <FormControl>
      <OutlinedInput
        value={term}
        onChange={(e) => setTerm(e.target.value)}
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
  maxOptions: PropTypes.bool,
}

export default MultiSelect
