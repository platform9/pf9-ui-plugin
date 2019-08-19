import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import AutocompleteBase from 'core/components/AutocompleteBase'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import uuid from 'uuid'
import { assoc } from 'ramda'
import { makeStyles } from '@material-ui/styles'
import { Button } from '@material-ui/core'

const useKeyValueStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  autocomplete: {
    flexGrow: 1,
    marginRight: theme.spacing(0.5),
    '& .MuiFormControl-root': {
      marginTop: theme.spacing(0.5),
      marginBottom: 0
    },
  },
  deleteButton: {
    flexGrow: 0,
    padding: 0,
  },
}))

const KeyValue = ({ entry = {}, onChange, onDelete, keySuggestions, valueSuggestions }) => {
  const classes = useKeyValueStyles()
  const [state, setState] = useState({
    id: entry.id || uuid.v4(),
    key: entry.key || '',
    value: entry.value || '',
  })

  useEffect(() => {
    onChange(state)
  }, [state])

  const handleChange = field => value => setState(assoc(field, value, state))

  return (
    <div className={classes.root}>
      <AutocompleteBase
        label="Key"
        value={state.key}
        onChange={handleChange('key')}
        suggestions={keySuggestions}
        className={classes.autocomplete}
      />
      &nbsp;
      <AutocompleteBase
        label="Value"
        value={state.value}
        onChange={handleChange('value')}
        suggestions={valueSuggestions}
        className={classes.autocomplete}
      />
      <IconButton className={classes.deleteButton} onClick={onDelete}><DeleteIcon /></IconButton>
    </div>
  )
}

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexFlow: 'column',
    alignItems: 'flex-start',
    maxWidth: '100%',
  },
  addButton: {
    marginTop: theme.spacing(0.5),
  },
}))

const newEntry = () => ({ id: uuid.v4(), key: '', value: '' })

// Unfortunately React forces us to use `key` for each item in an
// array and we can't use the index because that will break
// functionality if we delete anything in the middle of the array.
// This forces us to inject an id field into every entry and then
// filter it out before submitting. :(
const addId = entry => ({ ...entry, id: uuid.v4() })

const KeyValues = ({ entries: _entries, onChange, keySuggestions, valueSuggestions }) => {
  const classes = useStyles()
  const entriesWithId = [...(_entries || []).map(addId), newEntry()]
  const [entries, setEntries] = useState(entriesWithId)

  const addBlankEntry = () => setEntries([...entries, newEntry()])
  const deleteEntry = id => () => setEntries(entries.filter(x => x.id !== id))
  const handleChange = entry => setEntries(entries.map(x => (x.id === entry.id) ? entry : x))

  useEffect(() => {
    // Remove empty entries and strip out id
    const noEmptyKeys = x => x.key.length > 0
    const removeId = ({ key, value }) => ({ key, value })
    const sanitized = (entries || []).filter(noEmptyKeys).map(removeId)
    onChange && onChange(sanitized)
  }, [entries])

  return (
    <div className={classes.root}>
      {entries.map(entry => (
        <KeyValue
          key={entry.id}
          keySuggestions={keySuggestions}
          valueSuggestions={valueSuggestions}
          entry={entry}
          onChange={handleChange}
          onDelete={deleteEntry(entry.id)}
        />
      ))}
      <Button className={classes.addButton} variant="text" onClick={addBlankEntry}>
        Add key / value pair
      </Button>
    </div>
  )
}

export const EntryShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
})

KeyValues.propTypes = {
  keySuggestions: PropTypes.arrayOf(PropTypes.string),
  valueSuggestions: PropTypes.arrayOf(PropTypes.string),
  entries: PropTypes.arrayOf(EntryShape),
  onChange: PropTypes.func,
}

export default KeyValues
