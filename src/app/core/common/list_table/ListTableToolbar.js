import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { Button, IconButton, Toolbar, Tooltip, Typography } from '@material-ui/core'
import { lighten } from '@material-ui/core/styles/colorManipulator'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import FilterListIcon from '@material-ui/icons/FilterList'
import SearchBar from 'core/common/SearchBar'
import ListTableColumnsSelector from 'core/common/list_table/ListTableColumnsSelector'

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.primary.main,
        backgroundColor: lighten(theme.palette.primary.light, 0.85)
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark
      },
  spacer: {
    flex: '1 1 100%'
  },
  actions: {
    color: theme.palette.text.secondary
  },
  title: {
    flex: '0 0 auto'
  }
})

const ListTableToolbar = ({
  classes,
  numSelected,
  title,
  onAdd,
  onDelete,
  onEdit,
  onSearchChange,
  searchTerm,
  columns,
  visibleColumns,
  onColumnsChange
}) => (
  <Toolbar
    className={classNames(classes.root, {
      [classes.highlight]: numSelected > 0
    })}
  >
    <div className={classes.title}>
      {numSelected > 0 ? (
        <Typography color="inherit" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography variant="h6">{title}</Typography>
      )}
    </div>
    <div className={classes.spacer} />
    <div className={classes.actions}>
      <Toolbar>
        {onSearchChange && (
          <SearchBar onSearchChange={onSearchChange} searchTerm={searchTerm} />
        )}
        {numSelected === 1 && onEdit && (
          <Tooltip title="Edit">
            <IconButton aria-label="Edit" onClick={onEdit}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
        {numSelected > 0 && onDelete && (
          <Tooltip title="Delete">
            <IconButton aria-label="Delete" onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
        {columns && onColumnsChange && (
          <ListTableColumnsSelector
            columns={columns}
            visibleColumns={visibleColumns}
            onColumnsChange={onColumnsChange}
          />
        )}
        <Tooltip title="Filter list">
          <IconButton aria-label="Filter list">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        {onAdd && (
          <Tooltip title="Add">
            <Button color="primary" onClick={onAdd}>
              <AddIcon /> Add
            </Button>
          </Tooltip>
        )}
      </Toolbar>
    </div>
  </Toolbar>
)

ListTableToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func
}

export default withStyles(toolbarStyles)(ListTableToolbar)
