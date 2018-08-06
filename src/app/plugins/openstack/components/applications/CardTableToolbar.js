import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Toolbar } from '@material-ui/core'
import SearchBar from 'core/common/SearchBar'

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
  }
})

const CardTableToolbar = ({ classes, onSearchChange, searchTerm }) => (
  <Toolbar
    className={classes.root}
  >
    <div className={classes.spacer} />
    <div className={classes.actions}>
      <Toolbar>
        {onSearchChange &&
          <SearchBar
            onSearchChange={onSearchChange}
            searchTerm={searchTerm}
          />
        }
      </Toolbar>
    </div>
  </Toolbar>
)

export default withStyles(styles)(CardTableToolbar)
