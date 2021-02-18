// import { ListTableToolbar } from 'core/components/listTable/ListTableToolbar'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
} from '@material-ui/core'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight'
import makeStyles from '@material-ui/styles/makeStyles'
import Theme from 'core/themes/model'
import Text from 'core/elements/text'

const useRowStyles = makeStyles((theme: Theme) => ({
  row: {
    backgroundColor: theme.palette.grey[100],
    '& > *': {
      borderBottom: 'unset',
    },
  },
  cell: {
    padding: theme.spacing(2, 1),
    ...theme.typography.body2,
  },
}))

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    marginTop: theme.spacing(2),
  },
  appName: {
    color: theme.palette.blue[700],
  },
  headLabel: {
    color: theme.palette.grey[500],
    whiteSpace: 'nowrap',
    ...theme.typography.caption2,

    '& .MuiTableSortLabel-icon': {
      opacity: [1, '!important'],
      color: [theme.palette.grey[500], '!important'],
    },
    '&.MuiTableSortLabel-active': {
      color: theme.palette.grey[700],
    },
  },
  cellLabel: {
    color: `${theme.palette.text.primary} !important`,
  },
  cell: {
    padding: theme.spacing(2, 1),
    ...theme.typography.body2,
  },
}))

type Order = 'asc' | 'desc'

const renderApplicationName = (value) => {
  const classes = useStyles()
  return (
    <Text variant="body2" className={classes.appName}>
      {value}
    </Text>
  )
}
const renderNumClusters = (value) => <b>{value}</b>

export const viewByAppColumns = [
  { id: 'application', label: 'Application', render: renderApplicationName },
  {
    id: 'numClusters',
    label: '# of Clusters',
    render: renderNumClusters,
    disableSorting: true,
  },
  { id: 'cluster', label: 'Cluster', disableSorting: true },
  { id: 'namespace', label: 'Namespace', disableSorting: true },
  { id: 'version', label: 'App Version', disableSorting: true },
  { id: 'deploymentName', label: 'Deployment Name', disableSorting: true },
]

const rows = [
  { application: 'app1', numClusters: 7, version: '2.14' },
  { application: 'app2', numClusters: 0, version: '1' },
  { application: 'app3', numClusters: 3, version: '4.14' },
  { application: 'app4', numClusters: 0, version: '5.23' },
  { application: 'app5', numClusters: 1, version: '8.7' },
]

const renderDataCell = (col, row) => {
  const classes = useStyles()
  const { id, render } = col
  let content = row[col.id]
  if (render) {
    content = render(row[col.id])
  }

  return (
    <TableCell key={id} className={classes.cell}>
      {content}
    </TableCell>
  )
}

const Row = ({ row, open }) => {
  const [isOpen, setOpen] = useState(open)
  const classes = useRowStyles()

  useEffect(() => {
    setOpen(open)
  }, [open])

  return (
    <React.Fragment>
      <TableRow className={classes.row}>
        <TableCell padding="checkbox">
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!isOpen)}>
            {isOpen ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
        </TableCell>
        {viewByAppColumns.map((col: any) => renderDataCell(col, row))}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3} />
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className={classes.cell} align="left">
                    Subtotal
                  </TableCell>
                  <TableCell className={classes.cell} align="left">
                    {'hi'}
                  </TableCell>
                  <TableCell className={classes.cell} align="left">
                    Subtotal
                  </TableCell>
                  <TableCell className={classes.cell} align="left">
                    {'hi'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

const DeployedAppsTableAppView = ({ setOnDeleteFn, setColumns }) => {
  const classes = useStyles()
  const [showInnerTables, setShowInnerTables] = useState(true)
  const [appNameOrder, setAppNameOrder] = useState<Order>('asc')

  useEffect(() => {
    setColumns(viewByAppColumns)
    setOnDeleteFn(() => handleDelete)
  }, [setColumns, setOnDeleteFn])

  const handleDelete = () => {
    console.log('delete')
  }

  const handleAppNameSort = () => {
    setAppNameOrder(appNameOrder === 'asc' ? 'desc' : 'asc')
  }

  const renderRows = useCallback(
    () => rows.map((row) => <Row key={row.application} row={row} open={showInnerTables} />),
    [rows, showInnerTables],
  )

  return (
    <TableContainer>
      <Table className={classes.table} aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <IconButton
                aria-label="expand all rows"
                size="small"
                onClick={() => setShowInnerTables(!showInnerTables)}
              >
                {showInnerTables ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
              </IconButton>
            </TableCell>
            {viewByAppColumns.map((column: any, idx) => (
              <TableCell>
                <Tooltip
                  title={column.tooltip || column.label}
                  placement={column.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  {!column.disableSorting ? (
                    <TableSortLabel
                      className={classes.headLabel}
                      active={true}
                      direction={appNameOrder}
                      onClick={handleAppNameSort}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    <span className={classes.headLabel}>{column.label}</span>
                  )}
                </Tooltip>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>{renderRows()}</TableBody>
      </Table>
    </TableContainer>
  )
}

// export const appTableToolbarOptions = {
//   columns: viewByAppColumns,
//   onColumnToggle: () => console.log('column toggled'),
//   visibleColumn: [],
//   searchTerm: 'application',
//   onSearchChange: () => console.log('search changed'),
//   rowsPerPage: 10,
//   onChangeRowsPerPage: () => console.log('rows changed'),
//   onReload: () => console.log('reload'),
//   onEdit: () => console.log('edit'),
//   onDelete: () => console.log('edit'),
// }

// const DeployedAppsTableAppView = ({ extraLeftToolbarContent, setOnEdit }) => {
//   useEffect(() => {
//     setOnEdit(null)
//   }, [setOnEdit])
//   return (
//     <ListTableToolbar
//       columns={viewByAppColumns}
//       onColumnToggle={() => console.log('toggled')}
//       visibleColumns={[]}
//       extraToolbarContent={[]}
//       extraLeftToolbarContent={extraLeftToolbarContent}
//       onEdit={() => console.log('edit')}
//       onDelete={() => console.log('delete')}
//       searchTerm={'application'}
//       onSearchChange={() => console.log('search changed')}
//       rowsPerPage={10}
//       onChangeRowsPerPage={() => console.log('changed')}
//       onReload={() => console.log('reload')}
//     />
//   )
// }

export default DeployedAppsTableAppView
