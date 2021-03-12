import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Theme from 'core/themes/model'
import Text from 'core/elements/text'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { routes } from 'core/utils/routes'
import useReactRouter from 'use-react-router'
import ClusterDeployedAppsTable from './cluster-deployed-apps-table'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import SimpleLink from 'core/components/SimpleLink'
import useDataLoader from 'core/hooks/useDataLoader'
import { appsAvailableToClusterLoader, deployedAppActions } from 'k8s/components/apps/actions'
import clsx from 'clsx'
import Progress from 'core/components/progress/Progress'
import { repositoriesForClusterLoader } from 'k8s/components/repositories/actions'
import DisconnectRepositoryDialog from 'k8s/components/repositories/disconnect-repository-dialog'
import { allKey } from 'app/constants'

const useInfoCardStyles = makeStyles((theme: Theme) => ({
  card: {
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: 4,
    background: theme.palette.grey['000'],
    padding: theme.spacing(1, 3),
    overflow: 'auto',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
  },
  title: {
    color: theme.palette.grey[700],
  },
  infoTable: {
    padding: theme.spacing(1),
  },
  emptyMessageDiv: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    '& p': {
      color: theme.palette.grey[700],
    },
  },
}))

const useStyles = makeStyles((theme: Theme) => ({
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridGap: theme.spacing(2),
    minWidth: '1200px',
    marginBottom: theme.spacing(2),
  },
  overviewCard: {
    height: 'max-content',
  },
  repositoriesCard: {
    maxHeight: '280px',
  },
  rowHeader: {
    display: 'flex',
    justifyContent: 'flex-start',
    color: theme.palette.grey[700],
  },
  rowValue: {
    marginLeft: theme.spacing(4),
    color: theme.palette.grey[700],
    wordBreak: 'break-all',
  },
  repositoryLabel: {
    display: 'flex',
    alignItems: 'center',
  },
  deleteIcon: {
    marginRight: theme.spacing(1.5),
    color: theme.palette.blue[500],
  },
}))

const noRepositoriesMessage =
  'There are no repositories connected to this cluster. Connect a repository to enable access to applications to deploy.'

interface InfoCardProps {
  title: string
  className?: string
  buttonText: string
  buttonAction: (value) => void
  disableButton?: boolean
  items: any
  emptyItemsMessage?: string
}

const InfoCard = ({
  title,
  className,
  buttonText,
  buttonAction,
  disableButton = false,
  items,
  emptyItemsMessage,
}: InfoCardProps) => {
  const classes = useInfoCardStyles()
  return (
    <div className={clsx(classes.card, className)}>
      <header className={classes.header}>
        <div className={classes.title}>
          <Text variant="caption1">{title}</Text>
        </div>
        <div>
          <SubmitButton onClick={buttonAction} disabled={disableButton}>
            <Text variant="caption1">{buttonText}</Text>
          </SubmitButton>
        </div>
      </header>
      {items.length > 0 ? (
        <table className={classes.infoTable}>
          <tbody>
            {items.map(({ id, label, value }) => (
              <DetailRow key={id} label={label} value={value} />
            ))}
          </tbody>
        </table>
      ) : (
        <div className={classes.emptyMessageDiv}>
          <Text variant="body2">{emptyItemsMessage}</Text>
        </div>
      )}
    </div>
  )
}

interface DetailRowProps {
  label: string | React.ReactNode
  value: string | React.ReactNode
}

const DetailRow = ({ label, value }: DetailRowProps) => {
  const { rowHeader, rowValue } = useStyles()
  return (
    <tr>
      <td>
        {typeof label === 'string' ? (
          <Text className={rowHeader} variant="body2" component="span">
            {label}:
          </Text>
        ) : (
          label
        )}
      </td>
      <td>
        {typeof value === 'string' ? (
          <Text className={rowValue} variant="body2" component="span">
            {value}
          </Text>
        ) : (
          value
        )}
      </td>
    </tr>
  )
}

interface RepositoryLabelProps {
  name: string
  onClick: (value) => void
}

const RepositoryLabel = ({ name, onClick }: RepositoryLabelProps) => {
  const { repositoryLabel, deleteIcon } = useStyles()
  return (
    <div key={name} className={repositoryLabel}>
      <SimpleLink src="" onClick={() => onClick(name)}>
        <FontAwesomeIcon solid size="sm" className={deleteIcon}>
          minus-circle
        </FontAwesomeIcon>
      </SimpleLink>
      <Text variant="body2">{name}</Text>
    </div>
  )
}

const ClusterDeployedApps = ({ cluster }) => {
  const classes = useStyles()
  const { history } = useReactRouter()
  const [showDialog, setShowDialog] = useState(false)
  const [activeRepository, setActiveRepository] = useState(null)

  const [
    appsAvailableToCluster,
    loadingAppsAvailableToCluster,
    reloadAppsAvailableToCluster,
  ] = useDataLoader(appsAvailableToClusterLoader, { clusterId: cluster.uuid })

  const [deployedApps, loadingDeployedApps, reloadDeployedApps] = useDataLoader(
    deployedAppActions.list,
    {
      clusterId: cluster.uuid,
      namespace: allKey,
    },
  )

  const [repositories, loadingRepositories, reloadRepositories] = useDataLoader(
    repositoriesForClusterLoader,
    {
      clusterId: cluster.uuid,
    },
  )

  const filteredDeployedApps = useMemo(
    () => deployedApps.filter((app) => app.status !== 'uninstalling'),
    [deployedApps],
  )

  const numRepositories = useMemo(() => repositories.length, [repositories])

  useEffect(() => {
    reloadDeployedApps()
  }, [])

  const handleRepositoryDisconnectButtonClick = (name) => {
    setShowDialog(true)
    setActiveRepository(name)
  }

  const handleDialogClose = () => setShowDialog(false)

  const handleRepositoryDisconnect = async () => {
    handleDialogClose()
    // After user disconnects a repository from the cluster, we
    // want to refetch the list of repositories that are connected to the cluster
    await reloadRepositories()
    // Since the list of repositories the cluster is connected to has changed,
    // we need to refetch the list of apps available to the cluster
    await reloadAppsAvailableToCluster()
  }

  const overviewFields = useMemo(() => {
    return [
      {
        id: 'version',
        label: 'Kubernetes Version',
        value: cluster.kubeRoleVersion,
      },
      {
        id: 'apps',
        label: 'Number of Apps',
        value: filteredDeployedApps.length.toString(),
      },
      {
        id: 'workerNodes',
        label: 'Number of Worker Nodes',
        value: cluster.numWorkers?.toString(),
      },
    ]
  }, [cluster, filteredDeployedApps])

  const renderRepositoryLabel = useCallback(
    (name) => <RepositoryLabel name={name} onClick={handleRepositoryDisconnectButtonClick} />,
    [],
  )

  const renderRepositoryValue = useCallback(
    (numDeployedAppsFromRepository, totalAppsInRepository) => (
      <Text className={classes.rowValue} variant="body2">
        <b>{`${numDeployedAppsFromRepository} of ${totalAppsInRepository}`}</b> apps deployed
      </Text>
    ),
    [],
  )

  const repositoryFields = useMemo(() => {
    return repositories.map((repository) => {
      const numDeployedAppsFromRepository = deployedApps.filter(
        (app) => app.repository === repository.name && app.status !== 'uninstalling',
      ).length
      const totalAppsInRepository = appsAvailableToCluster.filter(
        (app) => app.repository === repository.name,
      ).length
      return {
        id: repository.name,
        label: renderRepositoryLabel(repository.name),
        value: renderRepositoryValue(numDeployedAppsFromRepository, totalAppsInRepository),
      }
    })
  }, [repositories, appsAvailableToCluster, deployedApps])

  const loadingSomething =
    loadingAppsAvailableToCluster || loadingDeployedApps || loadingRepositories

  return (
    <>
      {showDialog && (
        <DisconnectRepositoryDialog
          name={activeRepository}
          clusterId={cluster.uuid}
          onSubmit={handleRepositoryDisconnect}
          onClose={handleDialogClose}
        />
      )}
      <Progress loading={loadingSomething} renderContentOnMount={!loadingSomething}>
        <div className={classes.cardsContainer}>
          <InfoCard
            title="OVERVIEW"
            className={classes.overviewCard}
            buttonText="Deploy App"
            buttonAction={() => history.push(routes.apps.list.path())}
            disableButton={numRepositories === 0}
            items={overviewFields}
          />
          <InfoCard
            title="REPOSITORIES"
            className={classes.repositoriesCard}
            buttonText="Connect Repository"
            buttonAction={() => history.push(routes.repositories.add.path())}
            items={repositoryFields}
            emptyItemsMessage={noRepositoriesMessage}
          />
        </div>
        <ClusterDeployedAppsTable
          apps={filteredDeployedApps}
          clusterId={cluster.uuid}
          history={history}
        />
      </Progress>
    </>
  )
}

export default ClusterDeployedApps
