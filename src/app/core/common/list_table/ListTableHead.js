import React from 'react'
import moize from 'moize'
import PropTypes from 'prop-types'
import { assoc } from 'ramda'
import { Checkbox, TableCell, TableHead, TableRow, TableSortLabel, Tooltip } from '@material-ui/core'

class ListTableHead extends React.Component {
  createSortHandler = moize(id => event => {
    const { onRequestSort } = this.props
    if (onRequestSort) {
      onRequestSort(event, id)
    }
  })

  createDragHandler = moize(id => e => {
    e.dataTransfer.setData('columnId', id)
    this.setState(assoc('dragging', true))
  })

  createDropHandler = moize(id => e => {
    const sourceColumnId = e.dataTransfer.getData('columnId')
    this.props.onColumnsSwitch(sourceColumnId, id)
  })

  handleDragOver = e => e.preventDefault()

  render () {
    const {
      canDragColumns,
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

    const firstBlank = blankFirstColumn
      ? <TableCell padding="checkbox" key="_firstBlank" /> : null

    return (
      <TableHead>
        <TableRow>
          {headerCheckbox}
          {firstBlank}
          {columns.map(column =>
            <TableCell
              draggable={canDragColumns}
              onDragStart={canDragColumns ? this.createDragHandler(column.id) : null}
              onDragOver={canDragColumns ? this.handleDragOver : null}
              onDrop={canDragColumns ? this.createDropHandler(column.id) : null}
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
            </TableCell>)}
          {showRowActions &&
            <TableCell padding="default" key="__actions__">Actions</TableCell>}
        </TableRow>
      </TableHead>
    )
  }
}

ListTableHead.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
    display: PropTypes.bool,
    excluded: PropTypes.bool,
  })).isRequired,
  canDragColumns: PropTypes.bool,
  onColumnsSwitch: PropTypes.func,
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

ListTableHead.defaultProps = {
  numSelected: 0,
}

export default ListTableHead
