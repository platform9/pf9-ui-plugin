import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import {
  InputAdornment,
  TextField
} from '@material-ui/core'
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
class SearchBar extends React.Component {
  render () {
    const { classes, onSearch, onClear, searchTerm } = this.props
    return (
      searchTerm !== undefined && <TextField
        placeholder='Search'
        className={classes.SearchBar}
        onChange={onSearch}
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
                onClick={onClear}
              />
            </InputAdornment>
          )
        }}
      />
    )
  }
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired
}

export default SearchBar
