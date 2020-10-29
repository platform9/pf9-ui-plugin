import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import AutocompleteBase from 'core/components/AutocompleteBase'
import uuid from 'uuid'
import { assoc } from 'ramda'
import { makeStyles } from '@material-ui/styles'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import Text from 'core/elements/text'

const useKeyValueStyles = makeStyles((theme) => ({
  root: {
    display: 'grid',
    gridTemplateColumns: '200px 6px 200px 32px',
    gridTemplateRows: '55px',
    gridGap: '12px',
    justifyItems: 'start',
    alignItems: 'center',
  },
  autocomplete: {
    width: 200,

    '& .MuiFormControl-root': {
      marginTop: 0,
      marginBottom: 0,
      width: '100%',
    },
  },
  minus: {
    fontWeight: 900,
    color: theme.palette.blue.main,
    justifySelf: 'end',
  },
}))

const KeyValue = ({
  entry = {},
  onChange,
  onDelete,
  keySuggestions,
  valueSuggestions,
  keyLabel = 'Key',
  valueLabel = 'Value',
}) => {
  const classes = useKeyValueStyles()
  const [state, setState] = useState({
    id: entry.id || uuid.v4(),
    key: entry.key || '',
    value: entry.value || '',
  })

  useEffect(() => {
    onChange(state)
  }, [state])

  const handleChange = (field) => (value) => setState(assoc(field, value, state))

  return (
    <div className={classes.root}>
      <AutocompleteBase
        inputProps={{ size: 14 }}
        fullWidth
        label={keyLabel}
        value={state.key}
        onChange={handleChange('key')}
        suggestions={keySuggestions}
        className={classes.autocomplete}
      />
      <Text variant="body2">-</Text>
      <AutocompleteBase
        inputProps={{ size: 14 }}
        fullWidth
        label={valueLabel}
        value={state.value}
        onChange={handleChange('value')}
        suggestions={valueSuggestions}
        className={classes.autocomplete}
      />
      <FontAwesomeIcon className={classes.minus} onClick={onDelete}>
        minus-circle
      </FontAwesomeIcon>
    </div>
  )
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'column',
    alignItems: 'flex-start',
    maxWidth: '100%',
  },
  addButton: {
    marginTop: theme.spacing(2),
    color: theme.palette.grey[700],
    outline: 0,
    padding: 0,
    background: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  plus: {
    color: theme.palette.primary.main,
    marginRight: theme.spacing(2),
    fontWeight: 900,
  },
}))

const newEntry = () => ({ id: uuid.v4(), key: '', value: '' })

// Unfortunately React forces us to use `key` for each item in an
// array and we can't use the index because that will break
// functionality if we delete anything in the middle of the array.
// This forces us to inject an id field into every entry and then
// filter it out before submitting. :(
const addId = (entry) => ({ ...entry, id: uuid.v4() })

const KeyValues = ({
  entries: _entries,
  onChange,
  keySuggestions,
  valueSuggestions,
  blacklistedTags,
  addLabel,
  keyLabel,
  valueLabel,
}) => {
  const classes = useStyles()
  const entriesWithId = [...(_entries || []).map(addId), newEntry()]
  const [entries, setEntries] = useState(entriesWithId)

  const addBlankEntry = () => setEntries([...entries, newEntry()])
  const deleteEntry = (id) => () => setEntries(entries.filter((x) => x.id !== id))
  const handleChange = (entry) => setEntries(entries.map((x) => (x.id === entry.id ? entry : x)))

  useEffect(() => {
    // Remove empty entries and strip out id
    const noEmptyKeys = (x) => x.key.length > 0
    const removeId = ({ key, value }) => ({ key, value })
    const sanitized = (entries || []).filter(noEmptyKeys).map(removeId)
    onChange && onChange(sanitized)
  }, [entries])

  const filteredEntries = entries.filter((entry) => !blacklistedTags.includes(entry.key))

  return (
    <div className={classes.root}>
      {filteredEntries.map((entry) => (
        <KeyValue
          key={entry.id}
          keySuggestions={keySuggestions}
          valueSuggestions={valueSuggestions}
          entry={entry}
          onChange={handleChange}
          onDelete={deleteEntry(entry.id)}
          keyLabel={keyLabel}
          valueLabel={valueLabel}
        />
      ))}
      <button className={classes.addButton} onClick={addBlankEntry}>
        <FontAwesomeIcon className={classes.plus}>plus-circle</FontAwesomeIcon>
        <Text variant="body2">{addLabel}</Text>
      </button>
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
  blacklistedTags: PropTypes.arrayOf(PropTypes.string),
}

export default KeyValues
