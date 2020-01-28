import React, { useCallback, useState } from 'react'
import { Table, TableCell, TableRow, TableBody, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import ExpansionPanel from 'core/components/expansionPanel/ExpansionPanel'
import Theme from 'core/themes/model'
import OnboardWizard from './onboard-wizard'
import NextButton from 'core/components/buttons/NextButton'
import useReactRouter from 'use-react-router'
import CodeBlock from 'core/components/CodeBlock'
import { OnboardingAccessSetup, OnboardingMonitoringSetup } from 'app/constants'
import useDataLoader from 'core/hooks/useDataLoader'
import { clusterActions } from '../infrastructure/clusters/actions'
import PrometheusAddonDialog from '../prometheus/PrometheusAddonDialog'
import { ICluster } from '../infrastructure/clusters/model'
import { routes } from 'core/utils/routes'

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    maxWidth: 800,
  },
  table: {
    '& tr:last-child': {
      border: 'none',
      '& td': {
        border: 'none',
      }
    },
    marginTop: theme.spacing(2),
  },
  centerContent: {
    display: 'flex',
    alignItems: 'center'
  }
}))

export const clustersHaveMonitoring = (clusters: any[]) =>
  !!clusters.find((cluster) => !!cluster?.combined?.usage?.grafanaLink) ||
  !!localStorage.getItem(OnboardingMonitoringSetup)

export const clustersHaveAccess = () => !!localStorage.getItem(OnboardingAccessSetup)

interface Props {
  onComplete: () => void
  initialPanel?: number
}

enum Panels {
  Cluster = 0,
  Access = 1,
  Monitoring = 2,
}

const ClusterSetup = ({ onComplete, initialPanel = Panels.Cluster }: Props) => {
  const { history } = useReactRouter()
  const classes = useStyles({})

  const [clusters, loading] = useDataLoader(clusterActions.list)
  const hasMonitoring = clustersHaveMonitoring(clusters)
  const hasAccess = clustersHaveAccess()

  const [activePanels, setActivePanels] = useState(new Set([initialPanel]))

  const handleCreateCluster = useCallback(() => {
    history.push(routes.cluster.add.path())
  }, [])

  const handleAccessCluster = useCallback(() => {
    history.push(routes.apiAccess.path())
  }, [])

  const togglePanel = useCallback(
    (panel) => () => {
      const newPanels = new Set(activePanels)
      const operation = activePanels.has(panel) ? 'delete' : 'add'
      newPanels[operation](panel)
      setActivePanels(newPanels)
    },
    [activePanels],
  )
  const handleSkipAccess = useCallback(() => {
    localStorage.setItem(OnboardingAccessSetup, 'true')
    const panelsToKeep = new Set(activePanels)
    panelsToKeep.delete(Panels.Access)
    if (!hasMonitoring) {
      panelsToKeep.add(Panels.Monitoring)
    } else {
      // skipping this step with the following step complete means we are done
      onComplete()
    }
    setActivePanels(panelsToKeep)
  }, [activePanels])

  const handleSkipMonitoring = useCallback(() => {
    localStorage.setItem(OnboardingMonitoringSetup, 'true')
    const panelsToKeep = new Set(activePanels)
    panelsToKeep.delete(Panels.Monitoring)
    setActivePanels(panelsToKeep)
    onComplete()
  }, [activePanels])

  if (loading) {
    return null
  }

  return (
    <div className={classes.container}>
      <OnboardWizard
        title="Create your first Kubernetes cluster"
        body="Create your first Kubernetes cluster so you can start running some appications on it."
      >
        <ExpansionPanel
          expanded={activePanels.has(Panels.Cluster)}
          onClick={togglePanel(Panels.Cluster)}
          stepNumber={1}
          completed={!!clusters.length}
          summary="Create Your Cluster"
        >
          <Typography variant="body1">
            Create your cluster on a laptop, virtual machine or a physical server
          </Typography>
          <NextButton showForward={false} onClick={handleCreateCluster}>
            Create Cluster
          </NextButton>
        </ExpansionPanel>
        <ExpansionPanel
          expanded={activePanels.has(Panels.Access)}
          onClick={togglePanel(Panels.Access)}
          stepNumber={2}
          summary="Access Your Cluster"
          completed={hasAccess}
          onSkip={handleSkipAccess}
          skipConfirmTitle="Skip the API access step in your getting started wizard?"
        >
          <Typography className={classes.centerContent} variant="body1" component="span">
            To access your cluster, you need to download the kubeconfig for your cluster and
            download <CodeBlock>kubectl</CodeBlock>
          </Typography>
          <NextButton showForward={false} onClick={handleAccessCluster}>
            Api Access
          </NextButton>
        </ExpansionPanel>
        <ExpansionPanel
          expanded={activePanels.has(Panels.Monitoring)}
          onClick={togglePanel(Panels.Monitoring)}
          stepNumber={3}
          completed={hasMonitoring}
          summary="Enable Monitoring For Your Cluster (Beta)"
          onSkip={handleSkipMonitoring}
          skipConfirmTitle="Skip the monitoring step in your getting started wizard?"
        >
          <Typography variant="body1" component="span">
            Now that your cluster is created, enable monitoring to view the cluster’s health stats
            realtime in a dashboard
          </Typography>
          {clusters.length > 0 && <MonitoringPrompt clusters={clusters} onComplete={handleSkipMonitoring} />}
        </ExpansionPanel>
      </OnboardWizard>
    </div>
  )
}

interface IMonitoringPromptProps {
  clusters: ICluster[]
  onComplete: () => void
}
const MonitoringPrompt = ({ clusters, onComplete }: IMonitoringPromptProps) => {
  const { table } = useStyles({})
  const [activeCluster, setActiveCluster] = useState<ICluster>()
  const toggleDialog = useCallback(
    (cluster?: ICluster) => (e) => {
      setActiveCluster(cluster)
      e && e.stopPropagation()
    },
    [activeCluster],
  )
  const handleComplete = useCallback((e) => {
    // TODO we really need to clean up how we pass event handlers around.
    toggleDialog()(e)
    if (e === true) {
      onComplete()
    }
  }, [])

  return (
    <>
      {!!activeCluster && <PrometheusAddonDialog rows={[activeCluster]} onClose={handleComplete} />}
      <Table className={table}>
        <TableBody>
          {clusters.map((cluster: any = {}) => (
            <TableRow key={cluster.uuid}>
              <TableCell><Typography variant="subtitle2">{cluster.name}</Typography></TableCell>
              <TableCell>
                <NextButton showForward={false} onClick={toggleDialog(cluster)}>
                  Enable
                </NextButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default ClusterSetup
