import React, { useEffect, useMemo, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import ViewByButton from './view-by-button'
import { except, objSwitchCase } from 'utils/fp'
import DeployedAppsTableClusterView, {
  viewByClustersColumns,
} from './deployed-apps-table-cluster-view'
import DeployedAppsTableAppView, { viewByAppColumns } from './deployed-apps-table-app-view'
import ListTableToolbar from 'core/components/listTable/ListTableToolbar'
import { pluck } from 'ramda'
const objSwitchCaseAny: any = objSwitchCase // types on forward ref .js file dont work well.

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  leftToolBarContent: {
    marginLeft: theme.spacing(2),
    display: 'flex',
  },
  divider: {
    width: 1,
    height: 'auto',
    backgroundColor: theme.palette.grey[200],
    margin: theme.spacing(0, 2),
    border: 'none',
  },
}))

enum TableViews {
  Clusters = 'clusters',
  Application = 'application',
}

const tableColumns: any = {
  [TableViews.Clusters]: viewByClustersColumns,
  [TableViews.Application]: viewByAppColumns,
}

const DeployedAppsListPage = (props: Props) => {
  const classes = useStyles(props)
  const [activeTableView, setActiveTableView] = useState<TableViews>(TableViews.Clusters)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [columns, setColumns] = useState(tableColumns[activeTableView])
  const [visibleColumns, setVisibleColumns] = useState(
    pluck<any, string>('id', tableColumns[activeTableView]),
  )
  const [reloadFn, setReloadFn] = useState<any>(null)
  const [onEditFn, setOnEditFn] = useState(null)

  useEffect(() => {
    // setColumns(tableColumns[activeTableView])
    // setVisibleColumns(tableColumns[activeTableView])
  }, [activeTableView])

  const ActiveTable = useMemo(() => {
    return objSwitchCaseAny({
      [TableViews.Clusters]: DeployedAppsTableClusterView,
      [TableViews.Application]: DeployedAppsTableAppView,
    })(activeTableView)
  }, [activeTableView])

  const showDivider = !(activeTableView === TableViews.Clusters)

  const handleColumnToggle = (columnId) => {
    setVisibleColumns(
      visibleColumns.includes(columnId)
        ? except(columnId, visibleColumns)
        : [...visibleColumns, columnId],
    )
  }

  return (
    <>
      <ListTableToolbar
        columns={columns}
        selected={[{ id: 'kim', name: 'kim', desciption: 'hello' }]}
        extraToolbarContent={[]}
        visibleColumns={visibleColumns}
        onColumnToggle={handleColumnToggle}
        extraLeftToolbarContent={
          <div className={classes.leftToolBarContent}>
            <ViewByButton
              label="By Clusters"
              active={activeTableView === TableViews.Clusters}
              value={TableViews.Clusters}
              onClick={setActiveTableView}
            />
            <ViewByButton
              label="By Application"
              active={activeTableView === TableViews.Application}
              value={TableViews.Application}
              onClick={setActiveTableView}
            />
            {showDivider && <hr className={classes.divider} />}
          </div>
        }
        onEdit={onEditFn}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onReload={reloadFn}
      />
      <ActiveTable
        searchTerm={searchTerm}
        setColumns={setColumns}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        setReloadFn={setReloadFn}
        setOnEditFn={setOnEditFn}
      />
      {/* <ActiveTable
        extraLeftToolbarContent={
          <div className={classes.leftToolBarContent}>
            <ViewByButton
              label="By Clusters"
              active={activeTableView === TableViews.Clusters}
              value={TableViews.Clusters}
              onClick={setActiveTableView}
            />
            <ViewByButton
              label="By Application"
              active={activeTableView === TableViews.Application}
              value={TableViews.Application}
              onClick={setActiveTableView}
            />
            {showDivider && <hr className={classes.divider} />}
          </div>
        }
      /> */}
    </>
  )
}

interface Props {
  showDivider?: boolean
}

export default DeployedAppsListPage
