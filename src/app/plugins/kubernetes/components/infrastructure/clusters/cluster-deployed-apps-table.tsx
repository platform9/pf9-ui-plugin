import React, { useCallback, useState } from 'react'
// import { Table, TableCell, TableHead, TableRow, TableSortLabel } from '@material-ui/core'
import Theme from 'core/themes/model'
import { makeStyles } from '@material-ui/styles'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import { capitalize, IconButton } from '@material-ui/core'
import clsx from 'clsx'
import Text from 'core/elements/text'
import SimpleLink from 'core/components/SimpleLink'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import DeleteAppDeploymentDialog from 'k8s/components/apps/delete-app-deployment-dialog'
import { routes } from 'core/utils/routes'

const useStyles = makeStyles((theme: Theme) => ({
  appTable: {
    minWidth: '1200px',
  },
  columnHeaders: {
    display: 'grid',
    gridTemplateColumns: '150px 1fr 1fr 200px 200px',
    gridGap: theme.spacing(2),
  },
  nameColHeader: {
    alignContent: 'center',
  },
  icon: {
    fontSize: 18,
    color: theme.palette.grey[500],
    marginRight: 4,
    marginLeft: 4,
  },
  iconDirectionDesc: {
    transform: 'rotate(0deg)',
  },
  iconDirectionAsc: {
    transform: 'rotate(180deg)',
  },
  cellLabel: {
    color: `${theme.palette.text.primary} !important`,
  },
  columnLabel: {
    color: theme.palette.grey[500],
    whiteSpace: 'nowrap',
    ...theme.typography.caption2,
  },
  divider: {
    color: theme.palette.grey[700],
  },
}))

const useRowStyles = makeStyles((theme: Theme) => ({
  card: {
    height: '100px',
    border: `0.5px solid${theme.palette.grey[200]}`,
    borderRadius: 4,
    backgroundColor: theme.palette.grey['000'],
    display: 'grid',
    gridTemplateColumns: '150px 1fr 1fr 200px 200px',
    marginTop: theme.spacing(1),
    gridGap: theme.spacing(2),
  },
  cell: {
    alignSelf: 'center',
  },
  appCell: {
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr',
    alignItems: 'center',
    gridGap: theme.spacing(4),
  },
  iconCell: {
    display: 'flex',
    alignItems: 'center',
  },
  appIcon: {
    marginLeft: theme.spacing(5),
    marginRight: theme.spacing(4),
    height: '50px',
    width: '40px',
  },
  divider: {
    height: '80px',
    width: 1,
    backgroundColor: theme.palette.grey[200],
    border: 'none',
  },
  nameCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  actionsCell: {
    alignItems: 'center',
    display: 'flex',
    '& hr': {
      marginLeft: theme.spacing(0),
      marginRight: theme.spacing(4),
    },
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    padding: theme.spacing(4),
    gridGap: theme.spacing(3),
  },
  text: {
    color: theme.palette.grey[700],
  },
}))

const columns = [
  { id: 'icon', label: '', disableSorting: true },
  { id: 'name', label: 'App Deployment Name', className: 'nameColHeader' },
  { id: 'namespace', label: 'Namespace', disableSorting: true },
  { id: 'version', label: 'Version', disableSorting: true },
]

const placeholderIcon = '/ui/images/app-catalog/app-cat-placeholder-logo@2x.png'

const AppRow = ({ app, onEdit, onDelete }) => {
  const { icon, name, chart, namespace, chart_version } = app
  const getIconUrl = useCallback((icon) => {
    return icon && icon.match(/.(jpg|jpeg|png|gif)/) ? icon : placeholderIcon
  }, [])
  const classes = useRowStyles()
  return (
    <div className={classes.card}>
      <div className={classes.iconCell}>
        <img alt={name} src={getIconUrl(icon)} className={classes.appIcon} />
        <hr className={classes.divider} />
      </div>
      <div className={classes.appCell}>
        <div className={classes.nameCell}>
          <Text variant="subtitle2">{name}</Text>
          <Text variant="body2">{chart}</Text>
        </div>
      </div>
      <div className={classes.cell}>
        <Text className={classes.text} variant="caption1">
          {namespace}
        </Text>
      </div>
      <div className={classes.cell}>
        <Text className={classes.text} variant="caption1">
          {chart_version}
        </Text>
      </div>
      <div className={classes.actionsCell}>
        <hr className={classes.divider} />
        <div className={classes.actions}>
          <SimpleLink src="" onClick={() => onEdit(app)}>
            <FontAwesomeIcon size="md">edit</FontAwesomeIcon>
          </SimpleLink>
          <SimpleLink src="" onClick={() => onDelete(app)}>
            <FontAwesomeIcon size="md">trash-alt</FontAwesomeIcon>
          </SimpleLink>
        </div>
      </div>
    </div>
  )
}

type Order = 'Asc' | 'Desc'

const ClusterDeployedAppsTable = ({ apps, clusterId, history }) => {
  const classes = useStyles()
  const [order, setOrder] = useState<Order>('Asc')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [activeApp, setActiveApp] = useState(null)

  const handleSort = () => {
    const newOrder = order === 'Asc' ? 'Desc' : 'Asc'
    setOrder(newOrder)
  }

  const handleAppDeploymentDeletion = (app) => {
    setActiveApp(app)
    setShowDeleteDialog(true)
  }

  return (
    <div className={classes.appTable}>
      {showDeleteDialog && (
        <DeleteAppDeploymentDialog
          clusterId={clusterId}
          namespace={activeApp.namespace}
          name={activeApp.name}
          chart={activeApp.chart}
          onClose={() => setShowDeleteDialog(false)}
        />
      )}
      <div className={classes.columnHeaders}>
        {columns.map(({ label, disableSorting, className = '' }) => (
          <div key={label}>
            <span className={clsx(classes.columnLabel, classes[className])}>{label}</span>
            {!disableSorting && (
              <IconButton component="span" size="small" disableRipple={true} onClick={handleSort}>
                <ArrowDownwardIcon
                  className={clsx(classes.icon, classes[`iconDirection${capitalize(order)}`])}
                />
              </IconButton>
            )}
          </div>
        ))}
      </div>
      <hr className={classes.divider} />
      {apps.map((app) => (
        <AppRow
          key={app.name}
          app={app}
          onEdit={() =>
            history.push(
              routes.apps.deployed.edit.path({
                clusterId,
                namespace: app.namespace,
                name: app.name,
              }),
            )
          }
          onDelete={handleAppDeploymentDeletion}
        />
      ))}
    </div>
  )
}

export default ClusterDeployedAppsTable
