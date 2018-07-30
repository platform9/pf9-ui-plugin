import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import {
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Tooltip,
  Typography
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import FilterListIcon from '@material-ui/icons/FilterList'
import SearchIcon from '@material-ui/icons/Search'
import ClearIcon from '@material-ui/icons/Clear'
import grey from '@material-ui/core/colors/grey'

const styles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
  },
  spacer: {
    flex: '1 1 100%',
  },
  actions: {
    color: theme.palette.text.secondary,
  },
  title: {
    flex: '0 0 auto',
  },
  searchBar: {
    marginRight: theme.spacing.unit * 2.5
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

const CardTableToolbar = ({ classes, title, onAdd, onSearch, onClear, searchTerm }) => (
  <Toolbar
    className={classes.root}
  >
    <div className={classes.spacer} />
    <div className={classes.actions}>
      <Toolbar>
        {onSearch &&
          <TextField
            className={classes.searchBar}
            placeholder="Search"
            value={searchTerm}
            onChange={onSearch}
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
                  <Tooltip title="Clear search">
                    <ClearIcon
                      className={classes.clearIcon}
                      color="action"
                      onClick={onClear}
                    />
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />
        }
      </Toolbar>
    </div>
  </Toolbar>
)

export default withStyles(styles)(CardTableToolbar)
