/* eslint-disable react/no-did-update-set-state */

import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import {
  Checkbox,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TablePagination,
  TableRow
} from '@material-ui/core'
import EnhancedTableHead from './EnhancedTableHead'
import EnhancedTableToolbar from './EnhancedTableToolbar'
import { compose } from 'core/fp'
import { withAppContext } from 'core/AppContext'

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

// TODO: this component should take an optional sort function in the columns prop (eg. for IP addresses)

@withStyles(styles)
class ListTable extends React.Component {
  constructor (props) {
    super(props)
    const { columns, getUserPreferences } = props
    const prefs = (getUserPreferences && getUserPreferences()) || {}

    this.state = {
      order: 'asc',
      orderBy: columns[0].id,
      page: 0,
      rowsPerPage: prefs.perPage || 10,
      selected: [],
      searchTerm: '',
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

  sortData = (data) => {
    let _data = [...data]
    const orderBy = this.state.orderBy || this.props.columns[0].id
    const sorted =
      this.state.order === 'desc'
        ? _data.sort((a, b) => (b[orderBy] < a[orderBy] ? -1 : 1))
        : _data.sort((a, b) => (a[orderBy] < b[orderBy] ? -1 : 1))
    return sorted
  }

  areAllSelected = (data) => {
    const { selected } = this.state
    return data.every(row => selected.includes(row))
  }

  handleSelectAllClick = (event, checked) => {
    const { searchTarget, paginate, data } = this.props
    const { selected, searchTerm } = this.state

    let sortedData = this.sortData(data)
    const searchData = searchTerm === '' ? sortedData : this.filterBySearch(sortedData, searchTarget)
    const paginatedData = paginate ? this.paginate(searchData) : searchData

    let newSelected
    if (checked) {
      // Add active paginated rows that are not already selected
      newSelected = [...selected, ...paginatedData.filter(row => !selected.includes(row))]
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
      newSelected = newSelected.concat(selected, row)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      )
    }

    this.setState({ selected: newSelected })
  }

  handleChangePage = (event, page) => this.setState({ page })

  handleChangeRowsPerPage = event => {
    this.props.setUserPreference('perPage', event.target.value)
    this.setState({ rowsPerPage: event.target.value })
  }

  handleAdd = () => {
    this.props.onAdd()
  }

  handleDelete = () => {
    const { onDelete, data } = this.props
    const { selected, page, rowsPerPage } = this.state
    let maxPage = Math.ceil(data.length / rowsPerPage) - 1
    let newPage = page
    if (page === maxPage && selected.length === data.length % rowsPerPage) {
      newPage--
    } else if (selected.length === rowsPerPage) {
      newPage--
    }
    if (!onDelete) {
      return
    }

    onDelete(selected).then(() => {
      this.setState({
        selected: [],
        page: newPage
      })
    })
  }

  handleEdit = () => {
    const { selected } = this.state
    this.props.onEdit(selected)
  }

  handleSearch = value => {
    this.setState({
      searchTerm: value
    })
  }

  filterBySearch = (data, target) => {
    const { searchTerm } = this.state
    return data.filter(ele => ele[target].match(new RegExp(searchTerm, 'i')) !== null)
  }

  isSelected = row => this.state.selected.includes(row)

  paginate = data => {
    const { page, rowsPerPage } = this.state
    const startIdx = page * rowsPerPage
    const endIdx = startIdx + rowsPerPage
    return data.slice(startIdx, endIdx)
  }

  renderCell = (columnDef, contents) => {
    const { cellProps = {} } = columnDef
    return (
      <TableCell key={columnDef.id} {...cellProps} >
        {(typeof contents === 'boolean') ? String(contents) : contents}
      </TableCell>
    )
  }

  renderRow = row => {
    const { columns, showCheckboxes } = this.props
    const isSelected = this.isSelected(row)

    const checkboxProps = showCheckboxes ? {
      onClick: this.handleClick(row),
      role: 'checkbox',
      tabIndex: -1,
      selected: isSelected
    } : {}

    return (
      <TableRow hover key={row.id} {...checkboxProps}>
        {showCheckboxes &&
          <TableCell padding="checkbox">
            <Checkbox checked={isSelected} color="primary" />
          </TableCell>
        }
        {columns.map((columnDef, colIdx) =>
          this.renderCell(columnDef, row[columnDef.id]))
        }
      </TableRow>
    )
  }

  renderColumnHeader = (column, idx) => {
    const {
      headerProps = {},
      name,
    } = column
    return (
      <TableCell key={idx} {...headerProps}>
        {name}
      </TableCell>
    )
  }

  renderPaginationControls = (count) => {
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
      classes,
      columns,
      data,
      title,
      onAdd,
      onDelete,
      onEdit,
      showCheckboxes,
      searchTarget,
      paginate
    } = this.props

    const {
      order,
      orderBy,
      selected,
      searchTerm
    } = this.state

    if (!data) {
      return null
    }

    const sortedData = this.sortData(data)
    const searchData = searchTerm === '' ? sortedData : this.filterBySearch(sortedData, searchTarget)
    const paginatedData = paginate ? this.paginate(searchData) : searchData
    const selectedAll = this.areAllSelected(paginatedData)
    // Always show pagination control bar to make sure the height doesn't change frequently.
    // const shouldShowPagination = paginate && sortedData.length > this.state.rowsPerPage

    return (
      <Grid container justify="center">
        <Grid item xs={12} zeroMinWidth>
          <Paper className={classes.root}>
            <EnhancedTableToolbar
              numSelected={selected.length}
              title={title}
              onAdd={onAdd && this.handleAdd}
              onDelete={onDelete && this.handleDelete}
              onEdit={onEdit && this.handleEdit}
              onSearchChange={searchTarget && this.handleSearch}
              searchTerm={searchTerm}
            />
            <div className={classes.tableWrapper}>
              <Table className={classes.table}>
                <EnhancedTableHead
                  columns={columns}
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={this.handleSelectAllClick}
                  onRequestSort={this.handleRequestSort}
                  checked={selectedAll}
                  title={title}
                  rowCount={sortedData.length}
                  showCheckboxes={showCheckboxes}
                />
                <TableBody>
                  {paginatedData.map(this.renderRow)}
                </TableBody>
              </Table>
            </div>
            {this.renderPaginationControls(searchData.length)}
          </Paper>
        </Grid>
      </Grid>
    )
  }
}

ListTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  options: PropTypes.object,
  title: PropTypes.string.isRequired,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  paginate: PropTypes.bool,
  showCheckboxes: PropTypes.bool
}

ListTable.defaultProps = {
  data: [],
  columns: [],
  paginate: true,
  showCheckboxes: true
}

export default compose(
  withStyles(styles),
  withAppContext,
)(ListTable)
