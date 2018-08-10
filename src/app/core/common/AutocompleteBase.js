import React from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'
import { withStyles } from '@material-ui/core/styles'
import MenuList from '@material-ui/core/MenuList'
import MenuItem from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'

// This is being called 'Base' because it is standalone and does not
// integrate with ValidatedForm.
@withStyles({
})
class AutocompleteBase extends React.Component {
  state = {
    value: this.props.initialValue || '',
    open: this.props.initialValue && this.props.initialValue.length > 0,
  }

  matchedSuggestions = () => {
    const { suggestions } = this.props
    const { value } = this.state
    if (value.length === 0) {
      return suggestions
    }
    const r = new RegExp(value)
    const matched = suggestions.filter(x => r.test(x))
    return matched
  }

  propogateChange = () => {
    if (this.props.onChange) {
      this.props.onChange(this.value)
    }
  }

  handleChange = event => {
    const { value } = event.target
    this.setState({ value, open: true }, this.propogateChange)
  }

  // Note: that we are using `onMouseDown` instead of `onClick` to trigger this.
  // The reason is that the Textfield's `onBlur` is firing before the `onClick`
  // and deleting the suggestions when then makes it behave as if the suggestion
  // was never clicked.  `onBlur` does not happen until `onMouseUp` so this seems
  // to work.  Not sure about tap events.
  handleClick = item => () => {
    this.setState({ value: item, open: false })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  renderSuggestions = suggestions => {
    const { open } = this.state
    if (!open || !suggestions || suggestions.length === 0) { return null }
    return (
      <Paper>
        <MenuList>
          {suggestions.map(item => (
            <MenuItem key={item} onMouseDown={this.handleClick(item)}>{item}</MenuItem>
          ))}
        </MenuList>
      </Paper>
    )
  }

  render () {
    const matched = this.matchedSuggestions()
    const { value } = this.state
    const { suggestions, onChange, initialValue, ...other } = this.props

    return (
      <div>
        <TextField
          value={value}
          onChange={this.handleChange}
          onBlur={this.handleClose}
          {...other}
        />
        {this.renderSuggestions(matched)}
      </div>
    )
  }
}

// You can also pass any additional props and they will be added
// to the TextField.
AutocompleteBase.propTypes = {
  suggestions: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  initialValue: PropTypes.string,
}

export default AutocompleteBase
