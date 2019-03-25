import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import { InputAdornment, TextField } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import ClearIcon from '@material-ui/icons/Clear'
import grey from '@material-ui/core/colors/grey'

const styles = theme => ({
  SearchBar: {
    outline: 'none',
    padding: theme.spacing.unit * 2
  },
  clearIcon: {
    '&:hover': {
      color: grey[800],
    },
    '&:active': {
      color: grey[200]
    }
  }
})

@withStyles(styles)

// The selector containing searchBar needs to keep state of searchBar in parent component.
// To keep it aligned, please keep searchTerm in parent component of searchBar
class SearchBar extends React.Component {
  handleSearch = event => {
    this.props.onSearchChange(event.target.value)
  }

  handleClear = () => {
    this.props.onSearchChange('')
  }

  render () {
    const { classes, searchTerm } = this.props
    return (
      searchTerm !== undefined && <TextField
        placeholder='Search'
        className={classes.SearchBar}
        onChange={this.handleSearch}
        value={searchTerm}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment
              position="end"
              style={{ visibility: searchTerm.length > 0 ? '' : 'hidden' }}
            >
              <ClearIcon
                className={classes.clearIcon}
                color="action"
                onClick={this.handleClear}
              />
            </InputAdornment>
          )
        }}
      />
    )
  }
}

SearchBar.propTypes = {
  onSearchChange: PropTypes.func.isRequired
}

export default SearchBar
