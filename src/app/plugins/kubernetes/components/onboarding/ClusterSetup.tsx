import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { onboardingAccessSetup, onboardingMonitoringSetup } from 'app/constants'
import { useAppSelector } from 'app/store'
import CodeBlock from 'core/components/CodeBlock'
import ExpansionPanel from 'core/components/expansionPanel/ExpansionPanel'
import ExternalLink from 'core/components/ExternalLink'
import Button from 'core/elements/button'
import Text from 'core/elements/text'
import useListAction from 'core/hooks/useListAction'
import Theme from 'core/themes/model'
import { routes } from 'core/utils/routes'
import OnboardWizard from 'k8s/components/onboarding/OnboardWizard'
import { kubectlInstallationDocumentationLink } from 'k8s/links'
import React, { useCallback, useState } from 'react'
import useReactRouter from 'use-react-router'
import { emptyObj } from 'utils/fp'
import { listClusters } from '../infrastructure/clusters/actions'
import { IClusterSelector } from '../infrastructure/clusters/model'
import { makeParamsClustersSelector } from '../infrastructure/clusters/selectors'
import PrometheusAddonDialog from '../prometheus/PrometheusAddonDialog'

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    maxWidth: 800,
  },
  table: {
    '& tr:last-child': {
      border: 'none',
      '& td': {
        border: 'none',
      },
    },
    marginTop: theme.spacing(2),
  },
  centerContent: {
    display: 'flex',
    alignItems: 'center',
  },
  externalDocLink: {
    marginBottom: theme.spacing(1),
  },
}))

export const clustersHaveMonitoring = (clusters: any[]) =>
  !!clusters.find((cluster) => !!cluster?.combined?.usage?.grafanaLink) ||
  !!localStorage.getItem(onboardingMonitoringSetup)

export const clustersHaveAccess = () => !!localStorage.getItem(onboardingAccessSetup)

interface Props {
  onComplete: () => void
  initialPanel?: number
}

enum Panels {
  Cluster = 0,
  Access = 1,
  Monitoring = 2,
}

const selector = makeParamsClustersSelector()

const ClusterSetup = ({ onComplete, initialPanel = Panels.Cluster }: Props) => {
  const { history } = useReactRouter()
  const classes = useStyles({})

  const [loading] = useListAction(listClusters)
  const clusters = useAppSelector((state) => selector(state, emptyObj))

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
    localStorage.setItem(onboardingAccessSetup, 'true')
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
    localStorage.setItem(onboardingMonitoringSetup, 'true')
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
        body="Create your first Kubernetes cluster so you can start running some applications on it."
      >
        <ExpansionPanel
          expanded={activePanels.has(Panels.Cluster)}
          onClick={togglePanel(Panels.Cluster)}
          stepNumber={1}
          completed={!!clusters.length}
          summary="Create Your Cluster"
        >
          <Text variant="body2">
            Create your first Kubernetes cluster on AWS, Azure or BareOS (Physical or Virtual
            Machines)
          </Text>
          <br />
          <Button textVariant="body2" onClick={handleCreateCluster}>
            Create Cluster
          </Button>
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
          <Text className={classes.centerContent} variant="body2" component="span">
            To access your cluster, you need to download the kubeconfig for your cluster and
            download <CodeBlock>kubectl</CodeBlock>
          </Text>
          <ExternalLink
            className={classes.externalDocLink}
            url={kubectlInstallationDocumentationLink}
            icon="file-alt"
          >
            Getting Started with Kubectl
          </ExternalLink>
          <br />
          <Button textVariant="body2" onClick={handleAccessCluster}>
            API Access
          </Button>
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
          <Text variant="body2" component="span">
            Now that your cluster is created, enable monitoring to view the cluster’s health stats
            realtime in a dashboard
          </Text>
          {clusters.length > 0 && (
            <MonitoringPrompt clusters={clusters} onComplete={handleSkipMonitoring} />
          )}
        </ExpansionPanel>
      </OnboardWizard>
    </div>
  )
}

interface IMonitoringPromptProps {
  clusters: IClusterSelector[]
  onComplete: () => void
}

const MonitoringPrompt = ({ clusters, onComplete }: IMonitoringPromptProps) => {
  const { table } = useStyles({})
  const [activeCluster, setActiveCluster] = useState<IClusterSelector>()
  const toggleDialog = useCallback(
    (cluster?: IClusterSelector) => (e) => {
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
              <TableCell>
                <Text variant="subtitle2">{cluster.name}</Text>
              </TableCell>
              <TableCell>
                <Button textVariant="body2" onClick={toggleDialog(cluster)}>
                  Enable
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default ClusterSetup
