import React from 'react'
import PropTypes from 'prop-types'
import FormControl from '@material-ui/core/FormControl'
import Input from '@material-ui/core/Input'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import { withStyles } from '@material-ui/core/styles'
import MenuList from '@material-ui/core/MenuList'
import MenuItem from '@material-ui/core/MenuItem'
import Paper from '@material-ui/core/Paper'

// This is being called 'Base' because it is standalone and does not
// integrate with ValidatedForm.
@withStyles(theme => ({
  dropdownButton: { cursor: 'pointer' },
  container: { width: '350px' },
  absolute: { position: 'absolute' },
  relative: { position: 'relative' },
}))
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

  toggleOpen = () => {
    this.setState(state => ({ open: !state.open }))
  }

  renderSuggestions = suggestions => {
    const { open } = this.state
    const { classes } = this.props
    if (!open || !suggestions || suggestions.length === 0) { return null }
    return (
      <Paper className={`${classes.container} ${classes.absolute}`}>
        <MenuList
          open
          className={classes.container}>
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
    const { classes, suggestions, onChange, initialValue, ...other } = this.props
    const DropdownIcon = <ArrowDropDownIcon className={classes.dropdownButton} onClick={this.toggleOpen} />

    return (
      <div className={classes.relative}>
        <FormControl className={classes.container}>
          <Input
            value={value}
            onChange={this.handleChange}
            onBlur={this.handleClose}
            endAdornment={DropdownIcon}
            {...other}
          />
        </FormControl>
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
