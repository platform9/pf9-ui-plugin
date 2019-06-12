import React from 'react'
import PropTypes from 'prop-types'
import AddIcon from '@material-ui/icons/Add'
import ListTableColumnButton from 'core/components/listTable/ListTableColumnSelector'
import ListTableFilters from 'core/components/listTable/ListTableFilters'
import ListTableRowActions from './ListTableRowActions'
import SearchBar from 'core/components/SearchBar'
import classnames from 'classnames'
import { compose } from 'ramda'
import { Button, Toolbar, Tooltip, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import ListTableFiltersButton from 'core/components/listTable/ListTableFiltersButton'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

const toolbarStyles = theme => ({
  root: {
    paddingRight: theme.spacing.unit,
    color: theme.palette.grey[600],

  },
  highlight: {},
  spacer: {
    flex: '0 0 auto',
  },
  actions: {
    flex: '1 1 100%',
  },
  toolbar: {
    justifyContent: 'flex-end',
  },
  title: {
    flex: '0 0 auto',
    marginRight: theme.spacing.unit * 2,
    color: theme.palette.primary.contrastText,
  },
  rowActions: {
    color: 'inherit',
  },
  action: {
    marginTop: theme.spacing.unit * 2,
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    cursor: 'pointer',
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    lineHeight: 2,
    fontSize: theme.typography.fontSize * 0.8,
  },
  actionIcon: {
    fontSize: '1.7em',
  },
})

const ListTableToolbar = ({
  classes, columns, context, filterValues, filters, inlineFilters,
  onAdd, onColumnToggle, onDelete, onEdit, onFilterUpdate,
  onFiltersReset, onSearchChange,
  rowActions, searchTerm, selected, title, visibleColumns,
}) => {
  const numSelected = (selected || []).length
  return (
    <Toolbar
      className={classnames(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <div className={classes.title}>
        <Typography variant="h6">{title}</Typography>
      </div>
      <ListTableRowActions actionClassName={classes.action} rowActions={rowActions} selected={selected} />
      {numSelected === 1 && onEdit && (
        <Tooltip title="Edit">
          <div className={classes.action} onClick={onEdit}>
            <FontAwesomeIcon className={classes.actionIcon}>{'pencil-alt'}</FontAwesomeIcon>
            Edit
          </div>
        </Tooltip>
      )}
      {numSelected > 0 && onDelete && (
        <Tooltip title="Delete">
          <div className={classes.action} onClick={onDelete}>
            <FontAwesomeIcon className={classes.actionIcon}>{'trash-alt'}</FontAwesomeIcon>
            Delete
          </div>
        </Tooltip>
      )}
      <div className={classes.spacer} />
      <div className={classes.actions}>
        <Toolbar className={classes.toolbar}>
          {onSearchChange && (
            <SearchBar onSearchChange={onSearchChange} searchTerm={searchTerm} />
          )}
          {filters && inlineFilters && <ListTableFilters
            inline
            columns={columns}
            filters={filters}
            filterValues={filterValues}
            onFilterUpdate={onFilterUpdate}
            onFiltersReset={onFiltersReset}
          />}
          {columns && onColumnToggle && (
            <ListTableColumnButton
              columns={columns}
              visibleColumns={visibleColumns}
              onColumnToggle={onColumnToggle}
            />
          )}
          {filters && !inlineFilters && <ListTableFiltersButton
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
}

ListTableToolbar.propTypes = {
  title: PropTypes.string,
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
  inlineFilters: PropTypes.bool,
  filterValues: PropTypes.object,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onFilterUpdate: PropTypes.func,
  onFiltersReset: PropTypes.func,
  selected: PropTypes.array,
  visibleColumns: PropTypes.array,
  onColumnToggle: PropTypes.func,
}

export default compose(
  withStyles(toolbarStyles),
)(ListTableToolbar)
