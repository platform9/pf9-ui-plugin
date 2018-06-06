import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import Toolbar from 'material-ui/Toolbar'
import Tooltip from 'material-ui/Tooltip'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import AddIcon from 'material-ui-icons/Add'
import IconButton from 'material-ui/IconButton'
import DeleteIcon from 'material-ui-icons/Delete'
import FilterListIcon from 'material-ui-icons/FilterList'
import { lighten } from 'material-ui/styles/colorManipulator'
import { withStyles } from 'material-ui/styles'

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85),
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark,
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
})

const EnhancedTableToolbar = ({ classes, numSelected, title, onAdd, onDelete }) => (
  <Toolbar
    className={classNames(classes.root, {
      [classes.highlight]: numSelected > 0,
    })}
  >
    <div className={classes.title}>
      {numSelected > 0 ? (
        <Typography color="inherit" variant="subheading">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography variant="title">{title}</Typography>
      )}
    </div>
    <div className={classes.spacer} />
    <div className={classes.actions}>
      {numSelected > 0 && onDelete &&
        <Tooltip title="Delete">
          <IconButton aria-label="Delete" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      }
      <Toolbar>
        <Tooltip title="Filter list">
          <IconButton aria-label="Filter list">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        {onAdd &&
          <Tooltip title="Add">
            <Button color="primary" onClick={onAdd}><AddIcon /> Add</Button>
          </Tooltip>
        }
      </Toolbar>
    </div>
  </Toolbar>
)

EnhancedTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
}

export default withStyles(toolbarStyles)(EnhancedTableToolbar)
