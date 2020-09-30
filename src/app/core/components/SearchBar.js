import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import { InputAdornment, TextField } from '@material-ui/core'
import ClearIcon from '@material-ui/icons/Clear'
import { compose, pick } from 'ramda'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import clsx from 'clsx'

const styles = (theme) => ({
  SearchBar: {
    outline: 'none',
    margin: [0, '!important'],
    '& input::placeholder': {
      ...theme.typography.caption2,
    },
    '& input': {
      ...theme.typography.inputTable,
      color: theme.palette.grey[900],
    },
    '& .Mui-focused .searchIcon': {
      color: theme.palette.grey[700],
    },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.grey[700],
    },
    '& .MuiOutlinedInput-input': {
      padding: theme.spacing(1, 2, 1, 0),
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.grey[300],
    },
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.grey[700],
      },
      '& .searchIcon': {
        color: theme.palette.grey[700],
      },
    },
  },
  searchIcon: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.palette.grey[500],
    '&:hover': {
      color: theme.palette.grey[700],
    },
  },
  clearIcon: {
    color: theme.palette.grey[700],
    '&:hover': {
      color: theme.palette.grey[900],
    },
    '&:active': {
      color: theme.palette.grey[700],
    },
  },

  // classes for the InputProps
  root: {
    margin: [0, '!important'],
    minHeight: 40,
  },
  adornedStart: {
    paddingLeft: 8,
  },
  adornedEnd: {
    paddingRight: 8,
  },
})

// The selector containing searchBar needs to keep state of searchBar in parent component.
// To keep it aligned, please keep searchTerm in parent component of searchBar
class SearchBar extends PureComponent {
  handleSearch = (event) => {
    this.props.onSearchChange(event.target.value)
  }

  handleClear = () => {
    this.props.onSearchChange('')
  }

  render() {
    const { classes, searchTerm, className } = this.props
    return (
      searchTerm !== undefined && (
        <TextField
          variant="outlined"
          placeholder="Search"
          className={clsx(classes.SearchBar, className)}
          onChange={this.handleSearch}
          value={searchTerm}
          type="search"
          InputProps={{
            classes: pick(['root', 'adornedStart', 'adornedEnd'], classes),
            startAdornment: (
              <InputAdornment position="start">
                <FontAwesomeIcon className={`${classes.searchIcon} searchIcon`}>
                  search
                </FontAwesomeIcon>
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
            ),
          }}
        />
      )
    )
  }
}

SearchBar.propTypes = {
  onSearchChange: PropTypes.func.isRequired,
}

export default compose(withStyles(styles, { withTheme: true }))(SearchBar)
