import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { Button, IconButton, Toolbar, Tooltip, Typography } from '@material-ui/core'
import { lighten } from '@material-ui/core/styles/colorManipulator'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import SearchBar from 'core/common/SearchBar'
import ListTableColumnButton from 'core/common/list_table/ListTableColumnSelector'
import ListTableFiltersButton from 'core/common/list_table/ListTableFiltersButton'

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
  onColumnsChange,
  filters,
  filterValues,
  onFilterUpdate,
  onFiltersReset,
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
          <ListTableColumnButton
            columns={columns}
            visibleColumns={visibleColumns}
            onColumnsChange={onColumnsChange}
          />
        )}
        {filters && <ListTableFiltersButton
          columns={columns}
          filters={filters}
          filterValues={filterValues}
          onFilterUpdate={onFilterUpdate}
          onFiltersReset={onFiltersReset}
        />}
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
  columns: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
    render: PropTypes.func,
    sortWith: PropTypes.func,
    display: PropTypes.bool,
    excluded: PropTypes.bool,
  })).isRequired,
  filters: PropTypes.arrayOf(PropTypes.shape({
    columnId: PropTypes.string.isRequired,
    label: PropTypes.string, // Will override column label
    type: PropTypes.oneOf(['select', 'multiselect', 'checkbox', 'custom']).isRequired,
    render: PropTypes.func, // Use for rendering a custom component, received props: {value, onChange}
    filterWith: PropTypes.func, // Custom filtering function, received params: (filterValue, value, row)
    items: PropTypes.array, // Array of possible values (only when using select/multiselect)
  })),
  filterValues: PropTypes.object,
  onFilterUpdate: PropTypes.func,
  onFiltersReset: PropTypes.func,
  visibleColumns: PropTypes.array,
  onColumnsChange: PropTypes.func,
  numSelected: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func
}

export default withStyles(toolbarStyles)(ListTableToolbar)
