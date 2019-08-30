import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import { Grid, Paper, Radio, Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import ListTableHead from './ListTableHead'

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3)
  },
  table: {
    minWidth: 800,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
})

class ListTableSelect extends React.PureComponent {
  state = { selected: this.props.initialValue }

  handleClick = row => event => {
    const { onChange } = this.props
    this.setState({ selected: row })
    onChange && onChange(row)
  }

  isSelected = row => this.state.selected === row

  renderCell = (columnDef, contents) => {
    const { cellProps = {} } = columnDef
    let _contents = contents

    if (typeof contents === 'boolean') { _contents = String(_contents) }

    // Allow for customized rendering in the columnDef
    if (columnDef.render) { _contents = columnDef.render(contents) }

    return (
      <TableCell key={columnDef.id} {...cellProps}>{_contents}</TableCell>
    )
  }

  renderRow = row => {
    const { columns } = this.props
    const isSelected = this.isSelected(row)

    return (
      <TableRow hover key={row.id} onClick={this.handleClick(row)}>
        <TableCell padding="checkbox">
          <Radio checked={isSelected} color="primary" />
        </TableCell>
        {columns.map((columnDef, colIdx) =>
          this.renderCell(columnDef, row[columnDef.id]))
        }
      </TableRow>
    )
  }

  render () {
    const { classes, columns, data } = this.props

    if (!data) {
      return null
    }

    return (
      <Grid container justify="center">
        <Grid item xs={12} zeroMinWidth>
          <Paper className={classes.root}>
            <div className={classes.tableWrapper}>
              <Table className={classes.table}>
                <ListTableHead
                  columns={columns}
                  blankFirstColumn
                />
                <TableBody>
                  {data.map(this.renderRow)}
                </TableBody>
              </Table>
            </div>
          </Paper>
        </Grid>
      </Grid>
    )
  }
}

ListTableSelect.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func,
  initialValue: PropTypes.any,
}

ListTableSelect.defaultProps = {
  data: [],
  columns: [],
}

export default withStyles(styles)(ListTableSelect)
