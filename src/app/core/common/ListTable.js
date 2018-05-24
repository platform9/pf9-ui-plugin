import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Checkbox from 'material-ui/Checkbox'
import Paper from 'material-ui/Paper'
import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TablePagination,
  TableRow,
} from 'material-ui/Table'
import EnhancedTableHead from './EnhancedTableHead'
import EnhancedTableToolbar from './EnhancedTableToolbar'

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  table: {
    minWidth: 800,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
})

@withStyles(styles)
class ListTable extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      order: 'asc',
      orderBy: this.props.columns[0].id,
      page: 0,
      rowsPerPage: 5,
      selected: [],
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

  handleSelectAllClick = (event, checked) => {
    const { data } = this.props
    const getId = x => x.id
    this.setState({ selected: checked ? data.map(getId) : [] })
  }

  handleClick = id => event => {
    const { selected } = this.state
    const selectedIndex = selected.indexOf(id)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
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

  handleChangeRowsPerPage = event => this.setState({ rowsPerPage: event.target.value })

  handleAdd = () => {
    this.props.onAdd()
  }

  handleDelete = () => {
    const { onDelete } = this.props
    const { selected } = this.state
    if (!onDelete) {
      return
    }

    onDelete(selected).then(() => {
      this.setState({ selected: [] })
    })
  }

  isSelected = id => this.state.selected.includes(id)

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
        {contents}
      </TableCell>
    )
  }

  renderRow = row => {
    const { columns, showCheckboxes } = this.props
    const isSelected = this.isSelected(row.id)

    const checkboxProps = showCheckboxes ? {
      onClick: this.handleClick(row.id),
      role: 'checkbox',
      tabIndex: -1,
      selected: isSelected
    } : {}

    return (
      <TableRow hover key={row.id} {...checkboxProps}>
        {showCheckboxes &&
          <TableCell padding="checkbox">
            <Checkbox checked={isSelected} />
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
        count={count}
        rowsPerPage={rowsPerPage}
        page={page}
        backIconButtonProps={{ 'arial-label': 'Previous Page' }}
        nextIconButtonProps={{ 'arial-label': 'Next Page' }}
        onChangePage={this.handleChangePage}
        onChangeRowsPerPage={this.handleChangeRowsPerPage}
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
      showCheckboxes,
      paginate
    } = this.props

    const {
      order,
      orderBy,
      selected,
    } = this.state

    const sortedData = this.sortData(data)
    const paginatedData = paginate ? this.paginate(sortedData) : sortedData
    const shouldShowPagination = paginate && sortedData.length > this.state.rowsPerPage

    return (
      <Paper className={classes.root}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          title={title}
          onAdd={onAdd && this.handleAdd}
          onDelete={onDelete && this.handleDelete}
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
              title={title}
              rowCount={sortedData.length}
              showCheckboxes={showCheckboxes}
            />
            <TableBody>
              {paginatedData.map(this.renderRow)}
            </TableBody>
            {shouldShowPagination &&
              <TableFooter>
                <TableRow>
                  {this.renderPaginationControls(sortedData.length)}
                </TableRow>
              </TableFooter>
            }
          </Table>
        </div>
      </Paper>
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
  paginate: PropTypes.bool,
  showCheckboxes: PropTypes.bool
}

ListTable.defaultProps = {
  data: [],
  columns: [],
  paginate: true,
  showCheckboxes: true
}

export default ListTable
