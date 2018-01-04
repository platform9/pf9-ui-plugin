import React from 'react'
import PropTypes from 'prop-types'
import AutocompleteBase from 'core/components/AutocompleteBase'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import uuid from 'uuid'

class KeyValue extends React.Component {
  constructor (props) {
    super(props)
    const entry = props.entry || {}
    this.state = {
      id: entry.id || uuid.v4(),
      key: entry.key || '',
      value: entry.value || '',
    }
  }

  // Unfortunate overloading of naming going on here.
  // field is one of ['key', 'value'], and value is the value of the field.
  handleChange = field => value => {
    const { onChange } = this.props
    this.setState(
      () => ({ [field]: value }),
      () => onChange && onChange(this.state)
    )
  }

  render () {
    const { onDelete, keySuggestions, valueSuggestions } = this.props
    const { key, value } = this.state

    return (
      <div style={{ display: 'flex' }}>
        <AutocompleteBase
          label="Key"
          value={key}
          onChange={this.handleChange('key')}
          suggestions={keySuggestions}
        />
        &nbsp;
        <AutocompleteBase
          label="Value"
          value={value}
          onChange={this.handleChange('value')}
          suggestions={valueSuggestions}
        />
        <IconButton onClick={onDelete}><DeleteIcon /></IconButton>
      </div>
    )
  }
}

const newEntry = () => ({ id: uuid.v4(), key: '', value: '' })

// Unfortunately React forces us to use `key` for each item in an
// array and we can't use the index because that will break
// functionality if we delete anything in the middle of the array.
// This forces us to inject an id field into every entry and then
// filter it out before submitting. :(
const addId = entry => ({ ...entry, id: uuid.v4() })

class KeyValues extends React.Component {
  constructor (props) {
    super(props)
    const entries = (this.props.entries || []).map(addId)
    this.state = { entries: [...entries, newEntry()] }
  }

  addBlankEntry = () => {
    this.setState(state => ({
      entries: [...state.entries, newEntry()]
    }))
  }

  propogateChange = () => {
    // Remove empty entries and strip out id
    const noEmptyKeys = x => x.key.length > 0
    const removeId = ({ key, value }) => ({ key, value })
    const entries = (this.state.entries || []).filter(noEmptyKeys).map(removeId)
    if (this.props.onChange) {
      this.props.onChange(entries)
    }
  }

  deleteEntry = id => () => {
    this.setState(
      state => ({ entries: state.entries.filter(x => x.id !== id) }),
      this.propogateChange
    )
  }

  handleChange = entry => {
    this.setState(
      state => ({ ...state, entries: state.entries.map(x => (x.id === entry.id) ? entry : x) }),
      this.propogateChange
    )
  }

  render () {
    const { keySuggestions, valueSuggestions } = this.props

    return (
      <div>
        {this.state.entries.map(entry => (
          <KeyValue
            key={entry.id}
            keySuggestions={keySuggestions}
            valueSuggestions={valueSuggestions}
            entry={entry}
            onChange={this.handleChange}
            onDelete={this.deleteEntry(entry.id)}
          />
        ))}
        <div>
          <br />
          <Button variant="contained" color="primary" onClick={this.addBlankEntry}>Add key / value pair</Button>
        </div>
      </div>
    )
  }
}

const EntryShape = PropTypes.shape({
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
