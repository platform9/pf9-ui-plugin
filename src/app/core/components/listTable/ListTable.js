/* eslint-disable react/no-did-update-set-state */

import React from 'react'
import PropTypes from 'prop-types'
import {
  Checkbox, Grid, Paper, Table, TableBody, TableCell, TablePagination, TableRow,
} from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { compose, ensureFunction, except } from 'app/utils/fp'
import { withAppContext } from 'core/AppContext'
import MoreMenu from 'core/components/MoreMenu'
import {
  any, assoc, assocPath, equals, pipe, pluck, path, prop, propEq, propOr, uniq, update,
} from 'ramda'
import ListTableHead from './ListTableHead'
import ListTableToolbar from './ListTableToolbar'

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3
  },
  table: {
    minWidth: 800,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
})

// Reject all columns that are not visible or excluded
export const pluckVisibleColumnIds = columns =>
  columns
    .filter(column => column.display !== false && column.excluded !== true)
    .map(prop('id'))

class ListTable extends React.Component {
  constructor (props) {
    super(props)
    const { columns, visibleColumns, columnsOrder, rowsPerPage } = props
    this.state = {
      columns,
      visibleColumns: visibleColumns || pluckVisibleColumnIds(columns),
      columnsOrder: columnsOrder || pluck('id', columns),
      rowsPerPage: rowsPerPage,
      orderBy: columns[0].id,
      order: 'asc',
      page: 0,
      selected: [],
      searchTerm: '',
      filterValues: {}
    }
  }

  handleRequestSort = (event, property) => {
    const orderBy = property
    let order = 'desc'

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc'
    }

    this.setState({ order, orderBy })
  }

  sortData = data => {
    const { columns } = this.props
    const orderBy = this.state.orderBy || columns[0].id
    const sortWith = propOr(
      (prevValue, nextValue) => (nextValue < prevValue ? -1 : 1),
      'sortWith',
      columns.find(propEq('id', orderBy))
    )
    const sortedRows = [...data].sort((a, b) => sortWith(b[orderBy], a[orderBy]))

    return this.state.order === 'desc' ? sortedRows : sortedRows.reverse()
  }

  areAllSelected = data => {
    const { selected } = this.state
    return data.every(row => selected.includes(row))
  }

  handleSelectAllClick = (event, checked) => {
    const { paginate } = this.props
    const { selected } = this.state
    const filteredData = this.getFilteredRows()
    const paginatedData = paginate ? this.paginate(filteredData) : filteredData

    let newSelected
    if (checked) {
      // Add active paginated rows that are not already selected
      newSelected = uniq([...selected, ...paginatedData])
    } else {
      // Remove active paginated rows from selected
      newSelected = selected.filter(row => !paginatedData.includes(row))
    }
    this.setState({
      selected: newSelected
    })
  }

  handleClick = row => event => {
    const { selected } = this.state
    const selectedIndex = selected.indexOf(row)
    let newSelected = []

    if (selectedIndex === -1) {
      // not found
      newSelected = newSelected.concat(selected, row)
    } else if (selectedIndex === 0) {
      // first
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      // last
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      // somewhere inbetween
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      )
    }

    this.setState({ selected: newSelected })
  }

  handleChangePage = (event, page) => this.setState({ page })

  handleChangeRowsPerPage = event => {
    const { value: rowsPerPage } = event.target
    this.setState({ rowsPerPage }, () =>
      ensureFunction(this.props.onRowsPerPageChange)(rowsPerPage)
    )
  }

  handleAdd = () => {
    this.props.onAdd()
  }

  handleDelete = async () => {
    const { onDelete, data } = this.props
    if (!onDelete) {
      return
    }
    const { selected, page, rowsPerPage } = this.state
    const maxPage = Math.ceil(data.length / rowsPerPage) - 1
    const pastPage =
      (page === maxPage && selected.length === data.length % rowsPerPage) ||
      selected.length === rowsPerPage

    await onDelete(selected)

    this.setState({
      selected: [],
      page: pastPage ? page - 1 : page
    })
  }

  handleEdit = () => {
    ensureFunction(this.props.onEdit)(this.state.selected)
  }

  handleSearch = value => {
    if (this.props.searchTarget) {
      this.setState({
        searchTerm: value
      })
    }
  }

  handleColumnToggle = columnId => {
    if (this.props.canEditColumns) {
      this.setState(({ visibleColumns }) => ({
        visibleColumns: visibleColumns.includes(columnId)
          ? except(columnId, visibleColumns)
          : [...visibleColumns, columnId]
      }), () =>
        ensureFunction(this.props.onColumnsChange)({
          visibleColumns: this.state.visibleColumns,
          columnsOrder: this.state.columnsOrder,
        })
      )
    }
  }

  handleColumnsSwitch = (srcColumnId, destColumnId) => {
    const { columnsOrder } = this.state
    const srcColumnIdx = columnsOrder.indexOf(srcColumnId)
    const tarColumnIdx = columnsOrder.indexOf(destColumnId)
    this.setState(({ columnsOrder }) => ({
      columnsOrder: pipe(
        update(srcColumnIdx, destColumnId),
        update(tarColumnIdx, srcColumnId),
      )(columnsOrder)
    }), () =>
      ensureFunction(this.props.onColumnsChange)({
        visibleColumns: this.state.visibleColumns,
        columnsOrder: this.state.columnsOrder,
      })
    )
  }

  handleFilterUpdate = (columnId, selectedValue) => {
    this.setState(assocPath(['filterValues', columnId], selectedValue))
  }

  handleFiltersReset = () => {
    this.setState(assoc('filterValues', {}))
  }

  getFilterFunction = type => {
    switch (type) {
      case 'select':
        return equals
      case 'multiselect':
        return (filterValues, value) => any(equals(value))(filterValues)
      case 'checkbox':
        return equals
      default:
        return equals
    }
  }

  applyFilters = data => {
    const { filters } = this.props
    const { filterValues } = this.state
    const filterParams = Object.entries(filterValues)
      .map(([columnId, filterValue]) => ({
        columnId,
        filterValue,
        filter: filters.find(propEq('columnId', columnId))
      }))

    return filterParams.reduce((filteredData,
      { columnId, filterValue, filter }) => {
      if (filter.onChange) {
        // If a custom handler is provided, don't filter the data locally
        return filteredData
      }
      const filterWith = filter.filterWith || this.getFilterFunction(filter.type)

      return filteredData.filter(row => {
        return filterWith(filterValue, row[columnId])
      })
    }, data)
  }

  filterBySearch = (data, target) => {
    const { searchTerm } = this.state
    return data.filter(
      ele => ele[target].match(new RegExp(searchTerm, 'i')) !== null)
  }

  isSelected = row => this.state.selected.includes(row)

  paginate = data => {
    const { page, rowsPerPage } = this.state
    const startIdx = page * rowsPerPage
    const endIdx = startIdx + rowsPerPage
    return data.slice(startIdx, endIdx)
  }

  getFilteredRows = () => {
    const { searchTarget, data, filters } = this.props
    const { searchTerm } = this.state

    const sortedData = this.sortData(data)
    const searchData = searchTerm === '' ? sortedData : this.filterBySearch(sortedData, searchTarget)
    return filters ? this.applyFilters(searchData) : searchData
  }

  renderCell = (columnDef, contents, row) => {
    const { cellProps = {} } = columnDef
    let _contents = contents

    if (typeof contents === 'boolean') { _contents = String(_contents) }

    // Allow for customized rendering in the columnDef.  The render function might need
    // to know more about the entire object (row) being rendered and in some cases the
    // entire context.
    if (columnDef.render) { _contents = columnDef.render(contents, row, this.props.context) }

    return (
      <TableCell key={columnDef.id} {...cellProps}>{_contents}</TableCell>
    )
  }

  renderRowActions = row => {
    const { rowActions } = this.props
    if (!rowActions) { return null }
    return (
      <TableCell>
        <MoreMenu items={rowActions} data={row} />
      </TableCell>
    )
  }

  getSortedVisibleColumns = () => {
    const { columns } = this.props
    const { columnsOrder, visibleColumns } = this.state
    return columnsOrder
      .map(columnId => columns.find(column => column.id === columnId))
      .filter(column => column && column.id && visibleColumns.includes(column.id))
  }

  renderRow = row => {
    const { showCheckboxes, uniqueIdentifier } = this.props
    const isSelected = this.isSelected(row)

    const checkboxProps = showCheckboxes ? {
      onClick: this.handleClick(row),
      role: 'checkbox',
      tabIndex: -1,
      selected: isSelected
    } : {}

    const uid = uniqueIdentifier instanceof Function
      ? uniqueIdentifier(row)
      : row[uniqueIdentifier]

    return (
      <TableRow hover key={uid} {...checkboxProps}>
        {showCheckboxes && (<TableCell padding="checkbox">
          <Checkbox checked={isSelected} color="primary" />
        </TableCell>)}
        {this.getSortedVisibleColumns().map(columnDef =>
          this.renderCell(columnDef, path((columnDef.id || '').split('.'), row), row)
        )}
        {this.renderRowActions(row)}
      </TableRow>
    )
  }

  renderPaginationControls = count => {
    const { page, rowsPerPage } = this.state
    return (
      <TablePagination
        component="div"
        count={count}
        rowsPerPage={rowsPerPage}
        page={page}
        backIconButtonProps={{ 'arial-label': 'Previous Page' }}
        nextIconButtonProps={{ 'arial-label': 'Next Page' }}
        onChangePage={this.handleChangePage}
        onChangeRowsPerPage={this.handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
      />
    )
  }

  render () {
    const {
      batchActions,
      classes,
      columns,
      data,
      paginate,
      showCheckboxes,
      title,
      canDragColumns,
      filters,
    } = this.props

    const {
      order,
      orderBy,
      searchTerm,
      selected,
      visibleColumns,
      filterValues,
    } = this.state

    if (!data) {
      return null
    }

    const filteredData = this.getFilteredRows()
    const paginatedData = paginate ? this.paginate(filteredData) : filteredData
    const selectedAll = this.areAllSelected(paginatedData)
    // Always show pagination control bar to make sure the height doesn't change frequently.
    // const shouldShowPagination = paginate && sortedData.length > this.state.rowsPerPage

    return (
      <Grid container justify="center">
        <Grid item xs={12} zeroMinWidth>
          <Paper className={classes.root}>
            <ListTableToolbar
              selected={selected}
              title={title}
              onAdd={this.props.onAdd && this.handleAdd}
              onDelete={this.props.onDelete && this.handleDelete}
              onEdit={this.props.onEdit && this.handleEdit}
              onSearchChange={this.handleSearch}
              searchTerm={searchTerm}
              columns={columns}
              visibleColumns={visibleColumns}
              onColumnToggle={this.handleColumnToggle}
              filters={filters}
              filterValues={filterValues}
              onFilterUpdate={this.handleFilterUpdate}
              onFiltersReset={this.handleFiltersReset}
              batchActions={batchActions}
            />
            <div className={classes.tableWrapper}>
              <Table className={classes.table}>
                <ListTableHead
                  canDragColumns={canDragColumns}
                  columns={this.getSortedVisibleColumns()}
                  onColumnsSwitch={this.handleColumnsSwitch}
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={this.handleSelectAllClick}
                  onRequestSort={this.handleRequestSort}
                  checked={selectedAll}
                  title={title}
                  rowCount={data.length}
                  showCheckboxes={showCheckboxes}
                />
                <TableBody>
                  {paginatedData.map(this.renderRow)}
                </TableBody>
              </Table>
            </div>
            {this.renderPaginationControls(filteredData.length)}
          </Paper>
        </Grid>
      </Grid>
    )
  }
}

const actionProps = PropTypes.shape({
  label: PropTypes.string.isRequired,
  action: PropTypes.func,
  icon: PropTypes.node,
  cond: PropTypes.func,
  dialog: PropTypes.func,  // a React class or function
})

ListTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
    render: PropTypes.func,
    sortWith: PropTypes.func,
    /* Not displayed columns will only appear in the columns selector */
    display: PropTypes.bool,
    /* Excluded columns will neither appear in the grid nor in the columns selector */
    excluded: PropTypes.bool,
  })).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  options: PropTypes.object,
  title: PropTypes.string.isRequired,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  paginate: PropTypes.bool,
  orderBy: PropTypes.string,

  visibleColumns: PropTypes.arrayOf(PropTypes.string),
  rowsPerPage: PropTypes.number,

  /**
   * List of filters
   */
  filters: PropTypes.arrayOf(PropTypes.shape({
    columnId: PropTypes.string.isRequired,
    label: PropTypes.string, // Will override column label
    type: PropTypes.oneOf(['select', 'multiselect', 'checkbox', 'custom']).isRequired,
    render: PropTypes.func, // Use for rendering a custom component, received props: {value, onChange}
    filterWith: PropTypes.func, // Custom filtering function, received params: (filterValue, value, row)
    items: PropTypes.array, // Array of possible values (only when using select/multiselect)
  })),

  /*
   Some objects have a unique identifier other than 'id'
   For example sshKeys have unique identifier of 'name' and the APIs
   rely on using the name as part of the URI. Specify the unique identifier
   in props if it is different from 'id'

   For more complicated scenarios, you can pass a funciton that receives the row data and returns the uid.
   It has the following type signature:
     uniqueIdentifier :: RowData -> String
   */
  uniqueIdentifier: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func
  ]),

  /**
   * List of batch actions that can be performed
   * on the selected items.
   */
  batchActions: PropTypes.arrayOf(actionProps),

  /**
   * List of actions that can be performed on a single row.
   */
  rowActions: PropTypes.arrayOf(actionProps),

  onRowsPerPageChange: PropTypes.func,
  onColumnsChange: PropTypes.func,

  showCheckboxes: PropTypes.bool,
  searchTarget: PropTypes.string,

  canEditColumns: PropTypes.bool,
  canDragColumns: PropTypes.bool,
}

ListTable.defaultProps = {
  paginate: true,
  showCheckboxes: true,
  uniqueIdentifier: 'id',
  canEditColumns: true,
  canDragColumns: true,
  rowsPerPage: 10,
}

export default compose(
  withStyles(styles),
  withAppContext,
)(ListTable)
