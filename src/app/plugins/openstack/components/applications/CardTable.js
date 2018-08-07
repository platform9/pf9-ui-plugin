import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import {
  Grid,
  Paper,
  TablePagination,
} from '@material-ui/core'
import CardTableToolbar from './CardTableToolbar'
import ApplicationCard from './ApplicationCard'

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

@withStyles(styles)
class CardTable extends React.Component {
  state = {
    page: 0,
    rowsPerPage: 10,
    searchTerm: ''
  }

  handleSearch = value => {
    this.setState({
      searchTerm: value
    })
  }

  handleChangePage = () => {
    // TODO
  }

  handleChangeRowsPerPage = () => {
    // TODO
  }

  filterBySearch = (data, target) => {
    const { searchTerm } = this.state
    return data.filter(ele => ele[target].match(new RegExp(searchTerm, 'i')) !== null)
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
    const { classes, data, searchTarget } = this.props
    const { searchTerm } = this.state

    const searchData = searchTerm === '' ? data : this.filterBySearch(data, searchTarget)

    return (
      <Grid container justify="center">
        <Grid item xs={12} zeroMinWidth>
          <Paper className={classes.root}>
            <CardTableToolbar
              onSearchChange={searchTarget && this.handleSearch}
              searchTerm={searchTerm}
            />
            <Grid container spacing={24} justify="flex-start">
              {searchData.map(app => <ApplicationCard application={app} key={app.name} />)}
            </Grid>
            {this.renderPaginationControls(15)}
          </Paper>
        </Grid>
      </Grid>
    )
  }
}

CardTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
}

CardTable.defaultProps = {
  data: []
}

export default CardTable
