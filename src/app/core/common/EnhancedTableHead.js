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
    const { onRequestSort } = this.props
    if (onRequestSort) {
      onRequestSort(event, property)
    }
  }

  render () {
    const {
      blankFirstColumn,
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

    const firstBlank = blankFirstColumn ? <TableCell padding="checkbox" key="_firstBlank" /> : null

    return (
      <TableHead>
        <TableRow>
          {headerCheckbox}
          {firstBlank}
          {columns.map(column => {
            return (
              <TableCell
                key={column.id}
                numeric={column.numeric}
                padding={column.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === column.id ? order : false}
              >
                <Tooltip
                  title={column.label}
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
  numSelected: PropTypes.number,
  onRequestSort: PropTypes.func,
  onSelectAllClick: PropTypes.func,
  order: PropTypes.string,
  orderBy: PropTypes.string,
  rowCount: PropTypes.number,
  showCheckboxes: PropTypes.bool,
  showRowActions: PropTypes.bool,
  blankFirstColumn: PropTypes.bool,
}

EnhancedTableHead.defaultProps = {
  numSelected: 0,
}

export default EnhancedTableHead
