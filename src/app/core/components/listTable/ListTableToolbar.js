import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import AddIcon from '@material-ui/icons/Add'
import ListTableColumnButton from 'core/components/listTable/ListTableColumnSelector'
import ListTableBatchActions, { listTableActionPropType } from './ListTableBatchActions'
import SearchBar from 'core/components/SearchBar'
import clsx from 'clsx'
import { Button, Toolbar, Tooltip } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import Picklist from 'core/components/Picklist'
import { emptyArr } from 'utils/fp'
import { both, T } from 'ramda'
import RefreshButton from '../buttons/refresh-button'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    padding: theme.spacing(0, 2, 0, 1),
    color: theme.palette.grey[700],
    backgroundColor: theme.palette.grey[100],
    minHeight: 56,
    borderRadius: 4,
    '& .MuiOutlinedInput-root': {
      marginBottom: theme.spacing(1),
      marginRight: theme.spacing(2),
      height: 40,
    },
    '& .Mui-focused.MuiOutlinedInput-root fieldset': {
      borderColor: theme.palette.grey[700],
    },
    '& .MuiFormLabel-root.Mui-focused': {
      color: theme.palette.grey[700],
    },
  },
  highlight: {},
  actions: {
    flexGrow: 1,
    justifySelf: 'flex-end',
  },
  button: {
    cursor: 'pointer',
    fontWeight: 300,
    marginLeft: 25,
    color: theme.palette.grey[700],
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  toolbar: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 0,
    minHeight: 56,
    '& .MuiSelect-root': {
      paddingTop: theme.spacing(),
      paddingBottom: theme.spacing(),
    },
  },
  search: {
    margin: theme.spacing(1, 2, 0, 2),
    maxWidth: 240,
  },
  rowActions: {
    color: 'inherit',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: theme.palette.grey[200],
    margin: theme.spacing(0, 2),
    border: 'none',
  },
}))

const FilterDropdown = ({ field, type, label, onChange, value, items }) => {
  switch (type) {
    case 'select':
      return (
        <Picklist
          name={field}
          label={label}
          options={items}
          value={value || ''}
          onChange={onChange}
        />
      )
    default:
      return <div />
  }
}

const ListTableToolbar = ({
  columns,
  filterValues,
  filters,
  extraToolbarContent,
  onAdd,
  onColumnToggle,
  onDelete,
  onEdit,
  onFilterUpdate,
  onFiltersReset,
  onSearchChange,
  onReload,
  onRefresh,
  batchActions = emptyArr,
  searchTerm,
  selected,
  visibleColumns,
  rowsPerPage,
  onChangeRowsPerPage,
  rowsPerPageOptions,
  editCond,
  editDisabledInfo,
  deleteCond,
  deleteDisabledInfo,
  hideDelete,
  listTableParams,
}) => {
  const classes = useStyles()
  const numSelected = (selected || []).length

  const allActions = useMemo(
    () => [
      ...batchActions,
      ...(onEdit
        ? [
            {
              label: 'Edit',
              action: onEdit,
              icon: 'edit',
              cond: both(() => numSelected === 1, editCond || T),
              disabledInfo: editDisabledInfo,
            },
          ]
        : emptyArr),
      ...(onDelete && !hideDelete
        ? [
            {
              label: 'Delete',
              action: onDelete,
              icon: 'trash-alt',
              cond: deleteCond,
              disabledInfo: deleteDisabledInfo,
            },
          ]
        : emptyArr),
    ],
    [numSelected, batchActions, onEdit, onDelete],
  )

  const showDivider = onSearchChange && ((columns && onColumnToggle) || onAdd)

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      <ListTableBatchActions
        batchActions={allActions}
        selected={selected}
        onRefresh={onRefresh}
        listTableParams={listTableParams}
      />
      <div className={classes.actions}>
        <Toolbar className={classes.toolbar}>
          {Array.isArray(filters)
            ? filters.map(({ field, value, ...filterProps }) => (
                <FilterDropdown
                  key={field}
                  {...filterProps}
                  classes={classes}
                  onChange={onFilterUpdate(field)}
                  field={field}
                  value={value !== undefined ? value : filterValues[field]}
                />
              ))
            : filters}
          {extraToolbarContent}
          {onSearchChange && (
            <SearchBar
              className={classes.search}
              onSearchChange={onSearchChange}
              searchTerm={searchTerm}
            />
          )}
          {showDivider && <hr className={classes.divider} />}
          {columns && onColumnToggle && (
            <ListTableColumnButton
              columns={columns}
              visibleColumns={visibleColumns}
              onColumnToggle={onColumnToggle}
            />
          )}
          {onAdd && (
            <Tooltip title="Add">
              <Button color="primary" onClick={onAdd}>
                <AddIcon /> Add
              </Button>
            </Tooltip>
          )}
          {onReload && <RefreshButton onRefresh={onReload} />}
        </Toolbar>
      </div>
    </Toolbar>
  )
}

export const filterSpecPropType = PropTypes.shape({
  field: PropTypes.string.isRequired,
  label: PropTypes.string, // Will override column label
  type: PropTypes.oneOf(['select', 'multiselect', 'checkbox', 'custom']).isRequired,
  render: PropTypes.func, // Use for rendering a custom component, received props: {value, onChange}
  filterWith: PropTypes.func, // Custom filtering function, received params: (filterValue, value, row)
  items: PropTypes.array, // Array of possible values (only when using select/multiselect)
})

ListTableToolbar.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string,
      render: PropTypes.func,
      sortWith: PropTypes.func,
      display: PropTypes.bool,
      excluded: PropTypes.bool,
    }),
  ).isRequired,
  filters: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(filterSpecPropType)]),
  filterValues: PropTypes.object,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
  deleteCond: PropTypes.func,
  deleteDisabledInfo: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  editCond: PropTypes.func,
  editDisabledInfo: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onEdit: PropTypes.func,
  onFilterUpdate: PropTypes.func,
  onFiltersReset: PropTypes.func,
  onRefresh: PropTypes.func,
  onReload: PropTypes.func,
  batchActions: PropTypes.arrayOf(listTableActionPropType),
  selected: PropTypes.array,
  visibleColumns: PropTypes.array,
  onColumnToggle: PropTypes.func,
  rowsPerPage: PropTypes.number.isRequired,
  onChangeRowsPerPage: PropTypes.func.isRequired,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  hideDelete: PropTypes.bool,
}

export default ListTableToolbar
