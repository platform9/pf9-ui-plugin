/* eslint-disable react/no-did-update-set-state */

import {
  Grid,
  Radio,
  Table,
  TableBody,
  TableCell,
  TablePagination,
  TableRow,
} from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { LoadingGifs } from 'app/constants'
import { compose, ensureFunction, except } from 'app/utils/fp'
import clsx from 'clsx'
import { filterSpecPropType } from 'core/components/cardTable/CardTableToolbar'
import Checkbox from 'core/components/Checkbox'
import { listTableActionPropType } from 'core/components/listTable/ListTableBatchActions'
import MoreMenu from 'core/components/MoreMenu'
import Progress from 'core/components/progress/Progress'
import moize from 'moize'
import PropTypes from 'prop-types'
import {
  any,
  assoc,
  assocPath,
  equals,
  includes,
  max,
  pipe,
  pluck,
  prop,
  propEq,
  propOr,
  uniq,
  update,
} from 'ramda'
import React, { PureComponent } from 'react'
import { emptyArr, emptyObj, isNilOrEmpty, pathStr } from 'utils/fp'
import NoContentMessage from '../NoContentMessage'
import ListTableHead from './ListTableHead'
import ListTableToolbar from './ListTableToolbar'

const styles = (theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(2),
    minHeight: 300,
  },
  compactTableHeight: {
    minHeight: 'auto',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  tableRow: {
    transition: 'background .2s ease',
    '&:hover': {
      backgroundColor: [theme.palette.grey[100], '!important'],
    },
    '&.Mui-selected': {
      backgroundColor: theme.palette.blue[100],
    },
    '&.Mui-selected:hover': {
      backgroundColor: [theme.palette.blue[100], '!important'],
    },
  },
  cell: {
    padding: theme.spacing(2, 1),
    ...theme.typography.body2,
  },
  emptyList: {
    textAlign: 'left',
    margin: theme.spacing(1, 3),
  },
})

const minSearchLength = 3

const determineCheckboxCond = (checkboxCond, row) => {
  if (!checkboxCond) {
    return true
  }
  return checkboxCond(row)
}

// Reject all columns that are not visible or excluded
export const pluckVisibleColumnIds = (columns) =>
  columns.filter((column) => column.display !== false && column.excluded !== true).map(prop('id'))

class ListTable extends PureComponent {
  constructor(props) {
    super(props)
    const {
      columns,
      selectedRows,
      visibleColumns,
      columnsOrder,
      rowsPerPage,
      orderBy,
      orderDirection,
    } = props
    this.state = {
      columns,
      visibleColumns: visibleColumns || pluckVisibleColumnIds(columns),
      columnsOrder: columnsOrder || pluck('id', columns),
      rowsPerPage: rowsPerPage,
      orderBy: orderBy || columns[0].id,
      orderDirection: orderDirection || 'asc',
      page: 0,
      selected: selectedRows || emptyArr,
      searchTerm: '',
      filterValues: {},
    }
  }

  // Reset selected when the list of items is updated
  // This will be the case upon updating the cluster dropdown,
  // refreshing the list, or if there is any other reason
  // that the list changes.
  // In the future we may want to look into triggering this
  // only for a subset of above reasons.
  componentDidUpdate(prevProps) {
    const { data } = prevProps
    const { selected } = this.state
    const selectedIds = this.pluckDataIds(selected)
    const existingSelectedRows = data.filter((row) => selectedIds.includes(this.getRowId(row)))

    if (!equals(existingSelectedRows, selected)) {
      this.setState({
        selected: existingSelectedRows,
      })
    }
  }

  getRowId = (row) => {
    const { uniqueIdentifier } = this.props
    return uniqueIdentifier instanceof Function ? uniqueIdentifier(row) : row[uniqueIdentifier]
  }

  handleRequestSort = (event, property) => {
    const { onSortChange } = this.props
    const orderBy = property
    let orderDirection = 'desc'

    if (this.state.orderBy === property && this.state.orderDirection === 'desc') {
      orderDirection = 'asc'
    }
    this.setState({ orderDirection, orderBy }, () => {
      ensureFunction(onSortChange)(orderBy, orderDirection)
    })
  }

  sortData = (data) => {
    const { columns } = this.props
    const orderBy = this.state.orderBy || columns[0].id
    const sortWith = propOr(
      (prevValue, nextValue) => (nextValue < prevValue ? -1 : 1),
      'sortWith',
      columns.find(propEq('id', orderBy)),
    )
    const sortedRows = [...data].sort((a, b) => sortWith(b[orderBy], a[orderBy]))

    return this.state.orderDirection === 'desc' ? sortedRows : sortedRows.reverse()
  }

  areAllSelected = (data) => {
    const { selected } = this.state
    const { selectedRows = selected, checkboxCond } = this.props
    return data.every((row) => {
      if (checkboxCond) {
        // Ignore rows that do not meet condition criteria
        return includes(row, selectedRows) || !checkboxCond(row)
      }
      return includes(row, selectedRows)
    })
  }

  handleSelectAllClick = (event, checked) => {
    // Todo: exclude rows with no checkbox condition
    const { selected } = this.state
    const {
      paginate,
      onSelectedRowsChange,
      selectedRows = selected,
      onSelectAll,
      checkboxCond,
    } = this.props
    const filteredData = this.getFilteredRows()
    const paginatedData = paginate ? this.paginate(filteredData) : filteredData

    let newSelected
    if (checked) {
      // Add active paginated rows that are not already selected
      newSelected = uniq([...selectedRows, ...paginatedData])
    } else {
      // Remove active paginated rows from selected
      newSelected = selectedRows.filter((row) => !paginatedData.includes(row))
    }
    if (checkboxCond) {
      newSelected = newSelected.filter((item) => checkboxCond(item))
    }
    if (onSelectedRowsChange) {
      // Controlled mode
      onSelectedRowsChange(newSelected)
    } else {
      this.setState({
        selected: newSelected,
      })
    }

    onSelectAll && onSelectAll(newSelected, checked)
  }

  handleClick = moize(
    (row) => (event) => {
      // Todo: exclude rows with no checkbox condition
      const { selected } = this.state
      const isSelected = this.isSelected(row)
      const {
        multiSelection,
        onSelectedRowsChange,
        onSelect,
        selectedRows = selected,
        checkboxCond,
      } = this.props
      if (checkboxCond) {
        if (!checkboxCond(row)) {
          return
        }
      }
      if (!multiSelection) {
        if (onSelectedRowsChange) {
          // Controlled mode
          onSelectedRowsChange([row])
        } else {
          this.setState({
            selected: [row],
          })

          onSelect && onSelect(row)
        }
        return
      }
      const rowId = this.getRowId(row)
      const selectedIndex = selectedRows.findIndex(
        (selectedRow) => this.getRowId(selectedRow) === rowId,
      )
      const newSelected = []

      if (selectedIndex === -1) {
        // not found
        newSelected.push(...selectedRows, row)
      } else if (selectedIndex === 0) {
        // first
        newSelected.push(...selectedRows.slice(1))
      } else if (selectedIndex === selectedRows.length - 1) {
        // last
        newSelected.push(...selectedRows.slice(0, -1))
      } else if (selectedIndex > 0) {
        // somewhere inbetween
        newSelected.push(
          ...selectedRows.slice(0, selectedIndex),
          ...selectedRows.slice(selectedIndex + 1),
        )
      }

      if (onSelectedRowsChange) {
        // Controlled mode
        onSelectedRowsChange(newSelected)
      } else {
        this.setState({
          selected: newSelected,
        })

        onSelect && onSelect(row, isSelected)
      }
    },
    { maxSize: 100 },
  )

  handleChangePage = (event, page) => this.setState({ page })

  handleChangeRowsPerPage = (e) => {
    const { value: rowsPerPage } = e.target
    this.setState({ rowsPerPage }, () =>
      ensureFunction(this.props.onRowsPerPageChange)(rowsPerPage),
    )
  }

  handleAdd = () => {
    this.props.onAdd()
  }

  handleDelete = async () => {
    const { selected } = this.state
    const { onDelete, data, selectedRows = selected, onSelectedRowsChange } = this.props
    await onDelete(selectedRows)
    this.setState(
      {
        page: this.getCurrentPage(data.length),
      },
      () => {
        if (onSelectedRowsChange) {
          // Controlled mode
          onSelectedRowsChange(emptyArr)
        } else {
          this.setState({
            selected: emptyArr,
          })
        }
      },
    )
  }

  handleEdit = () => {
    ensureFunction(this.props.onEdit)(this.state.selected)
  }

  handleSearch = (value) => {
    if (this.props.searchTargets) {
      this.setState({
        searchTerm: value,
      })
    }
  }

  handleColumnToggle = (columnId) => {
    if (this.props.canEditColumns) {
      this.setState(
        ({ visibleColumns }) => ({
          visibleColumns: visibleColumns.includes(columnId)
            ? except(columnId, visibleColumns)
            : [...visibleColumns, columnId],
        }),
        () =>
          ensureFunction(this.props.onColumnsChange)(
            this.state.visibleColumns,
            this.state.columnsOrder,
          ),
      )
    }
  }

  handleColumnsSwitch = (srcColumnId, destColumnId) => {
    const { columnsOrder } = this.state
    const srcColumnIdx = columnsOrder.indexOf(srcColumnId)
    const tarColumnIdx = columnsOrder.indexOf(destColumnId)
    this.setState(
      ({ columnsOrder }) => ({
        columnsOrder: pipe(
          update(srcColumnIdx, destColumnId),
          update(tarColumnIdx, srcColumnId),
        )(columnsOrder),
      }),
      () =>
        ensureFunction(this.props.onColumnsChange)(
          this.state.visibleColumns,
          this.state.columnsOrder,
        ),
    )
  }

  handleFilterUpdate = (columnId, selectedValue) => {
    this.setState(assocPath(['filterValues', columnId], selectedValue))
  }

  handleFiltersReset = () => {
    this.setState(assoc('filterValues', {}))
  }

  getFilterFunction = (type) => {
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

  applyFilters = (data) => {
    const { filters } = this.props
    const { filterValues } = this.state
    const filterParams = Object.entries(filterValues).map(([columnId, filterValue]) => ({
      columnId,
      filterValue,
      filter: filters.find(propEq('columnId', columnId)),
    }))

    return filterParams.reduce((filteredData, { columnId, filterValue, filter }) => {
      if (filter.onChange) {
        // If a custom handler is provided, don't filter the data locally
        return filteredData
      }
      const filterWith = filter.filterWith || this.getFilterFunction(filter.type)

      return filteredData.filter((row) => {
        return filterWith(filterValue, row[columnId])
      })
    }, data)
  }

  filterBySearch = (data, targets) => {
    const { searchTerm } = this.state
    return data.filter((ele) =>
      targets.some((target) => ele[target].match(new RegExp(searchTerm, 'i')) !== null),
    )
  }

  pluckDataIds = (rows) => rows.map(this.getRowId)

  isSelected = (row) => {
    const { selected } = this.state
    const { selectedRows = selected } = this.props
    const selectedIds = this.pluckDataIds(selectedRows)
    const rowId = this.getRowId(row)
    return selectedIds.includes(rowId)
  }

  paginate = (data) => {
    const { rowsPerPage, searchTerm } = this.state

    const startIdx = this.getCurrentPage(data.length) * rowsPerPage
    const endIdx = startIdx + rowsPerPage
    return !searchTerm || searchTerm.length < minSearchLength ? data.slice(startIdx, endIdx) : data
  }

  getFilteredRows = () => {
    const { searchTargets, data, filters, onSortChange } = this.props
    const { searchTerm } = this.state

    const sortedData = onSortChange ? data : this.sortData(data)
    const searchData =
      !searchTerm || searchTerm.length < minSearchLength
        ? sortedData
        : this.filterBySearch(sortedData, searchTargets)
    return filters ? this.applyFilters(searchData) : searchData
  }

  renderCell = moize(
    (columnDef, contents, row, isSelected, cellClass) => {
      const { cellProps = emptyObj, id, render, Component: CellComponent } = columnDef
      let renderedCell = contents

      if (typeof contents === 'boolean') {
        renderedCell = String(renderedCell)
      }

      // Allow for customized rendering in the columnDef.  The render function might need
      // to know more about the entire object (row) being rendered and in some cases the
      if (render) {
        renderedCell = render(contents, row)
      } else if (CellComponent) {
        renderedCell = <CellComponent key={id} row={row} data={contents} isSelected={isSelected} />
      }

      return (
        <TableCell className={cellClass} key={id} {...cellProps}>
          {renderedCell}
        </TableCell>
      )
    },
    {
      maxSize: 1000,
    },
  )

  renderRowActions = (row) => {
    const { rowActions, onRefresh, onActionComplete = onRefresh } = this.props
    if (isNilOrEmpty(rowActions)) {
      return null
    }
    return (
      <TableCell>
        <MoreMenu items={rowActions} onComplete={onActionComplete} data={row} />
      </TableCell>
    )
  }

  getSortedVisibleColumns = () => {
    const { columns } = this.props
    const { columnsOrder, visibleColumns } = this.state
    return columnsOrder
      .map((columnId) => columns.find((column) => column.id === columnId))
      .filter((column) => column && column.id && visibleColumns.includes(column.id))
  }

  renderRow = (row) => {
    const { multiSelection, showCheckboxes, checkboxCond, classes } = this.props
    const isSelected = this.isSelected(row)

    const checkboxProps = showCheckboxes
      ? {
          onClick: this.handleClick(row),
          role: 'checkbox',
          tabIndex: -1,
          selected: isSelected,
        }
      : {}

    const uid = this.getRowId(row)

    return (
      <TableRow hover key={uid} {...checkboxProps} className={classes.tableRow}>
        {showCheckboxes && (
          <TableCell padding="checkbox">
            {determineCheckboxCond(checkboxCond, row) && (
              <>
                {multiSelection ? (
                  <Checkbox checked={isSelected} color="primary" />
                ) : (
                  <Radio checked={isSelected} color="primary" />
                )}
              </>
            )}
          </TableCell>
        )}
        {this.getSortedVisibleColumns().map((columnDef) =>
          this.renderCell(columnDef, pathStr(columnDef.id, row), row, isSelected, classes.cell),
        )}
        {this.renderRowActions(row)}
      </TableRow>
    )
  }

  getCurrentPage = (count) => {
    const { page, rowsPerPage } = this.state
    const lastPage = max(Math.ceil(count / rowsPerPage) - 1, 0)
    return page > lastPage ? lastPage : page
  }

  renderPaginationControls = (count) => {
    const { rowsPerPage } = this.state
    return (
      <TablePagination
        // labelRowsPerPage=""
        // labelDisplayedRows={() => ''}
        component="div"
        count={count}
        rowsPerPage={rowsPerPage}
        page={this.getCurrentPage(count)}
        backIconButtonProps={{ 'arial-label': 'Previous Page' }}
        nextIconButtonProps={{ 'arial-label': 'Next Page' }}
        onChangePage={this.handleChangePage}
        onChangeRowsPerPage={this.handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
      />
    )
  }

  renderEmptyList = () => {
    if (this.props.loading) {
      return null
    }
    return <NoContentMessage message={this.props.emptyText} />
  }

  render() {
    const {
      orderDirection,
      orderBy,
      searchTerm,
      selected,
      visibleColumns,
      filterValues,
      rowsPerPage,
    } = this.state
    const {
      batchActions,
      classes,
      columns,
      data,
      paginate,
      showCheckboxes,
      canDragColumns,
      filters,
      onReload,
      onRefresh,
      loading,
      onAdd,
      onDelete,
      deleteCond,
      deleteDisabledInfo,
      onEdit,
      editCond,
      editDisabledInfo,
      selectedRows = selected,
      size,
      compactTable,
      blankFirstColumn,
      extraToolbarContent,
      multiSelection,
      headless,
      hideDelete,
      alternativeTableContent,
      listTableParams,
      showPagination,
    } = this.props

    if (!data) {
      return null
    }

    const filteredData = this.getFilteredRows()
    const paginatedData = paginate ? this.paginate(filteredData) : filteredData
    const selectedAll = this.areAllSelected(paginatedData)
    // Always show pagination control bar to make sure the height doesn't change frequently.
    // const shouldShowPagination = paginate && sortedData.length > this.state.rowsPerPage

    const tableContent =
      paginatedData && paginatedData.length ? (
        <Table className={classes.table} size={size}>
          {!headless && (
            <ListTableHead
              canDragColumns={canDragColumns}
              columns={this.getSortedVisibleColumns()}
              onColumnsSwitch={this.handleColumnsSwitch}
              numSelected={selectedRows.length}
              order={orderDirection}
              orderBy={orderBy}
              onSelectAllClick={this.handleSelectAllClick}
              onRequestSort={this.handleRequestSort}
              checked={selectedAll}
              rowCount={filteredData.length}
              showCheckboxes={showCheckboxes}
              blankFirstColumn={blankFirstColumn}
              multiSelection={multiSelection}
            />
          )}
          <TableBody>{paginatedData.map(this.renderRow)}</TableBody>
        </Table>
      ) : (
        this.renderEmptyList()
      )

    return (
      <Progress
        loading={loading}
        overlay
        renderContentOnMount
        loadingImage={LoadingGifs.BluePinkTiles}
      >
        <Grid container justify="center">
          <Grid item xs={12} zeroMinWidth>
            <div className={clsx(classes.root, compactTable && classes.compactTableHeight)}>
              {!compactTable && (
                <ListTableToolbar
                  extraToolbarContent={extraToolbarContent}
                  selected={selectedRows}
                  onAdd={onAdd && this.handleAdd}
                  onDelete={onDelete && this.handleDelete}
                  deleteCond={deleteCond}
                  deleteDisabledInfo={deleteDisabledInfo}
                  onEdit={onEdit && this.handleEdit}
                  editCond={editCond}
                  editDisabledInfo={editDisabledInfo}
                  onSearchChange={this.handleSearch}
                  searchTerm={searchTerm}
                  columns={columns}
                  visibleColumns={visibleColumns}
                  onColumnToggle={this.handleColumnToggle}
                  filters={filters}
                  filterValues={filterValues}
                  onFilterUpdate={this.handleFilterUpdate}
                  onFiltersReset={this.handleFiltersReset}
                  onReload={onReload}
                  onRefresh={onRefresh}
                  batchActions={batchActions}
                  rowsPerPage={rowsPerPage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50, 100]}
                  hideDelete={hideDelete}
                  listTableParams={listTableParams}
                />
              )}
              {alternativeTableContent || (
                <div className={classes.tableWrapper}>{tableContent}</div>
              )}
              {!alternativeTableContent &&
                !compactTable &&
                showPagination &&
                this.renderPaginationControls(filteredData.length)}
            </div>
          </Grid>
        </Grid>
      </Progress>
    )
  }
}

ListTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string,
      render: PropTypes.func,
      sortWith: PropTypes.func,
      disableSorting: PropTypes.bool,
      /* Not displayed columns will only appear in the columns selector */
      display: PropTypes.bool,
      /* Excluded columns will neither appear in the grid nor in the columns selector */
      excluded: PropTypes.bool,
    }),
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  options: PropTypes.object,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
  deleteCond: PropTypes.func,
  deleteDisabledInfo: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  hideDelete: PropTypes.bool,
  onEdit: PropTypes.func,
  editCond: PropTypes.func,
  editDisabledInfo: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onReload: PropTypes.func,
  onRefresh: PropTypes.func,
  onActionComplete: PropTypes.func,
  paginate: PropTypes.bool,
  showPagination: PropTypes.bool,
  orderBy: PropTypes.string,
  orderDirection: PropTypes.oneOf(['asc', 'desc']),
  onSortChange: PropTypes.func,

  visibleColumns: PropTypes.arrayOf(PropTypes.string),
  rowsPerPage: PropTypes.number,
  emptyText: PropTypes.string,

  /**
   * List of filters
   */
  filters: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(filterSpecPropType)]),

  /*
   Some objects have a unique identifier other than 'id'
   For example sshKeys have unique identifier of 'name' and the APIs
   rely on using the name as part of the URI. Specify the unique identifier
   in props if it is different from 'id'

   For more complicated scenarios, you can pass a funciton that receives the row data and returns the uid.
   It has the following type signature:
     uniqueIdentifier :: RowData -> String
   */
  uniqueIdentifier: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

  /**
   * List of batch actions that can be performed
   * on the selected items.
   */
  batchActions: PropTypes.arrayOf(listTableActionPropType),

  /**
   * List of actions that can be performed on a single row.
   */
  rowActions: PropTypes.arrayOf(listTableActionPropType),

  onRowsPerPageChange: PropTypes.func,
  onColumnsChange: PropTypes.func,

  showCheckboxes: PropTypes.bool,
  searchTargets: PropTypes.arrayOf(PropTypes.string),

  canEditColumns: PropTypes.bool,
  canDragColumns: PropTypes.bool,

  loading: PropTypes.bool,

  /**
   * Wether or not to allow selecting multiple rows (checkboxes) or just one at a time (radio boxes)
   */
  multiSelection: PropTypes.bool,

  selectedRows: PropTypes.array,
  onSelectedRowsChange: PropTypes.func,
  onSelect: PropTypes.func,
  size: PropTypes.oneOf(['small', 'medium']),
  compactTable: PropTypes.bool,
  headless: PropTypes.bool,

  extraToolbarContent: PropTypes.node,
}

ListTable.defaultProps = {
  paginate: true,
  showPagination: true,
  showCheckboxes: true,
  multiSelection: true,
  uniqueIdentifier: 'id',
  canEditColumns: true,
  canDragColumns: true,
  rowsPerPage: 10,
  emptyText: 'No data found',
  loading: false,
  size: 'medium',
  compactTable: false,
}

export default compose(withStyles(styles))(ListTable)
