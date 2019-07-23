import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import AutocompleteBase from 'core/components/AutocompleteBase'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import SubmitButton from 'core/components/buttons/SubmitButton'
import uuid from 'uuid'
import { assoc } from 'ramda'

const KeyValue = ({ entry = {}, onChange, onDelete, keySuggestions, valueSuggestions }) => {
  const [state, setState] = useState({
    id: entry.id || uuid.v4(),
    key: entry.key || '',
    value: entry.value || '',
  })

  useEffect(() => onChange(state), [state])

  const handleChange = field => value => setState(assoc(field, value, state))

  return (
    <div style={{ display: 'flex' }}>
      <AutocompleteBase
        label="Key"
        value={state.key}
        onChange={handleChange('key')}
        suggestions={keySuggestions}
      />
      &nbsp;
      <AutocompleteBase
        label="Value"
        value={state.value}
        onChange={handleChange('value')}
        suggestions={valueSuggestions}
      />
      <IconButton onClick={onDelete}><DeleteIcon /></IconButton>
    </div>
  )
}

const newEntry = () => ({ id: uuid.v4(), key: '', value: '' })

// Unfortunately React forces us to use `key` for each item in an
// array and we can't use the index because that will break
// functionality if we delete anything in the middle of the array.
// This forces us to inject an id field into every entry and then
// filter it out before submitting. :(
const addId = entry => ({ ...entry, id: uuid.v4() })

const KeyValues = ({ entries: _entries, onChange, keySuggestions, valueSuggestions }) => {
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
    <div>
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
      <div>
        <br />
        <SubmitButton onClick={addBlankEntry}>Add key / value pair</SubmitButton>
      </div>
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
