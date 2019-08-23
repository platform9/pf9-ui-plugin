import { Grid, Paper, TablePagination, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import CardTableToolbar from './CardTableToolbar'
import { assocPath, assoc, propOr, propEq, pathOr } from 'ramda'
import { ensureFunction, compose } from 'utils/fp'
import moize from 'moize'
import Progress from 'core/components/progress/Progress'
import { filterSpecPropType } from 'core/components/cardTable/CardTableToolbar'

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
    minHeight: 300,
  },
  table: {
    minWidth: 800,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  emptyList: {
    textAlign: 'left',
    margin: theme.spacing(1, 4),
  },
})

class CardTable extends PureComponent {
  state = {
    rowsPerPage: this.props.rowsPerPage,
    orderBy: null,
    direction: 'asc',
    page: 0,
    selected: [],
    searchTerm: '',
    filterValues: {},
  }

  handleSearch = value => {
    if (this.props.searchTarget) {
      this.setState({
        searchTerm: value,
      })
    }
  }

  sortData = data => {
    const { sorting } = this.props
    const orderBy = this.state.orderBy || sorting[0].id
    const sortWith = propOr(
      (prevValue, nextValue) => (nextValue < prevValue ? -1 : 1),
      'sortWith',
      sorting.find(propEq('id', orderBy)),
    )
    const sortedRows = [...data].sort((a, b) =>
      sortWith(b[orderBy], a[orderBy]),
    )
    return this.state.direction === 'desc' ? sortedRows : sortedRows.reverse()
  }

  paginate = data => {
    const { page, rowsPerPage } = this.state
    const startIdx = page * rowsPerPage
    const endIdx = startIdx + rowsPerPage
    return data.slice(startIdx, endIdx)
  }

  handleFilterUpdate = moize(columnId => {
    const filter = this.props.filters.find(propEq('field', columnId))
    return selectedValue => {
      this.setState(
        assocPath(['filterValues', columnId], selectedValue),
        () => {
          filter.onChange && filter.onChange(selectedValue)
        },
      )
    }
  })

  handleFiltersReset = () => {
    this.setState(assoc('filterValues', {}))
  }

  handleChangePage = (event, page) => this.setState({ page })

  handleChangeRowsPerPage = event => {
    const { value: rowsPerPage } = event.target
    this.setState({ rowsPerPage }, () =>
      ensureFunction(this.props.onRowsPerPageChange)(rowsPerPage),
    )
  }

  filterBySearch = (data, target) => {
    const { searchTerm } = this.state
    return data.filter(
      ele =>
        pathOr('', target.split('.'), ele).match(
          new RegExp(searchTerm, 'i'),
        ) !== null,
    )
  }

  renderPaginationControls = count => {
    const { page, rowsPerPage } = this.state
    return (
      <TablePagination
        component="div"
        labelRowsPerPage="Items per page:"
        count={count}
        rowsPerPage={rowsPerPage}
        page={page}
        backIconButtonProps={{ 'arial-label': 'Previous Page' }}
        nextIconButtonProps={{ 'arial-label': 'Next Page' }}
        onChangePage={this.handleChangePage}
        onChangeRowsPerPage={this.handleChangeRowsPerPage}
        rowsPerPageOptions={[6, 12, 24, 48, 96]}
      />
    )
  }

  handleRequestSort = orderBy => {
    this.setState({ orderBy })
  }

  handleDirectionChange = moize(direction => e => {
    e.preventDefault()
    this.setState({ direction })
  })

  applyFilters = data => {
    const { filters } = this.props
    const { filterValues } = this.state
    const filterParams = Object.entries(filterValues).map(
      ([columnId, filterValue]) => ({
        columnId,
        filterValue,
        filter: filters.find(propEq('field', columnId)),
      }),
    )

    return filterParams.reduce(
      (filteredData, { columnId, filterValue, filter }) => {
        if (filter.onChange) {
          // If a custom handler is provided, don't filter the data locally
          return filteredData
        }
        const filterWith =
          filter.filterWith || this.getFilterFunction(filter.type)

        return filteredData.filter(row => {
          return filterWith(filterValue, row[columnId])
        })
      },
      data,
    )
  }

  getFilteredItems = () => {
    const { searchTarget, data, filters } = this.props
    const { searchTerm } = this.state
    const sortedData = this.sortData(data)
    const searchData =
      searchTerm === ''
        ? sortedData
        : this.filterBySearch(sortedData, searchTarget)
    return filters ? this.applyFilters(searchData) : searchData
  }

  renderEmptyList = () => {
    if (this.props.loading) {
      return null
    }
    return <Typography className={this.props.classes.emptyList} variant="h6">{this.props.emptyText}</Typography>
  }

  render () {
    const {
      title,
      direction,
      orderBy,
      filterValues,
      searchTerm,
    } = this.state
    const {
      classes, paginate,
      data, sorting, filters, children,
      onRefresh, loading,
    } = this.props

    if (!data) {
      return null
    }

    const filteredData = this.getFilteredItems()
    const paginatedData = paginate ? this.paginate(filteredData) : filteredData
    const gridContent = paginatedData && paginatedData.length
      ? paginatedData.map(children)
      : this.renderEmptyList()

    return (
      <Progress loading={loading} overlay renderContentOnMount>
        <Grid container justify="center">
          <Grid item xs={12} zeroMinWidth>
            <Paper className={classes.root}>
              <CardTableToolbar
                title={title}
                sorting={sorting}
                direction={direction}
                orderBy={orderBy}
                filters={filters}
                filterValues={filterValues}
                onFilterUpdate={this.handleFilterUpdate}
                onSearchChange={this.handleSearch}
                onSortChange={this.handleRequestSort}
                onRefresh={onRefresh}
                onDirectionChange={this.handleDirectionChange}
                searchTerm={searchTerm}
              />
              <Grid container spacing={3} justify="flex-start">
                {gridContent}
              </Grid>
              {this.renderPaginationControls(filteredData.length)}
            </Paper>
          </Grid>
        </Grid>
      </Progress>
    )
  }
}

CardTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  filters: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(filterSpecPropType)]),
  searchTarget: PropTypes.string,
  sorting: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      label: PropTypes.string, // Will override column label
      sortWith: PropTypes.func,
    }),
  ),
  onRefresh: PropTypes.func,
  loading: PropTypes.bool,
}

CardTable.defaultProps = {
  paginate: true,
  data: [],
  filters: [],
  sorting: [],
  rowsPerPage: 24,
  emptyText: 'No data found',
  loading: false,
}

export default compose(
  withStyles(styles),
)(CardTable)
