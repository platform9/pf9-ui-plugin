import React from 'react'
import PropTypes from 'prop-types'
import {
  Checkbox,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip
} from '@material-ui/core'

class EnhancedTableHead extends React.Component {
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property)
  }

  render () {
    const {
      checked,
      columns,
      numSelected,
      onSelectAllClick,
      order,
      orderBy,
      rowCount,
      showCheckboxes,
      showRowActions,
    } = this.props

    const headerCheckbox = showCheckboxes ? (
      <TableCell padding="checkbox">
        <Checkbox
          indeterminate={!checked && numSelected > 0 && numSelected < rowCount}
          checked={checked}
          onChange={onSelectAllClick}
          color='primary'
        />
      </TableCell>
    ) : null

    return (
      <TableHead>
        <TableRow>
          {headerCheckbox}
          {columns.map(column => {
            return (
              <TableCell
                key={column.id}
                numeric={column.numeric}
                padding={column.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === column.id ? order : false}
              >
                <Tooltip
                  title="Sort"
                  placement={column.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={order}
                    onClick={this.createSortHandler(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
            )
          }, this)}
          {showRowActions && <TableCell padding="default" key="__actions__">Actions</TableCell>}
        </TableRow>
      </TableHead>
    )
  }
}

EnhancedTableHead.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
  showCheckboxes: PropTypes.bool,
  showRowActions: PropTypes.bool,
}

export default EnhancedTableHead
