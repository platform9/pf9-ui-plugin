import React, { useCallback, useState } from 'react'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import ExpansionPanel from 'core/components/expansionPanel/ExpansionPanel'
import Theme from 'core/themes/model'
import { except } from 'utils/fp'
import OnboardWizard from './onboard-wizard'
import NextButton from 'core/components/buttons/NextButton'
import useReactRouter from 'use-react-router'
import CodeBlock from 'core/components/CodeBlock'

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    maxWidth: 800,
  },
}))

const ClusterSetup = () => {
  const [activePanels, setActivePanels] = useState([1])
  const { history } = useReactRouter()
  const classes = useStyles({})

  const handleCreateCluster = useCallback(() => {
    history.push('/ui/kubernetes/infrastructure/clusters/add')
  }, [])

  const handleAccessCluster = useCallback(() => {
    history.push('/ui/kubernetes/api_access')
  }, [])

  const togglePanel = useCallback(
    (panelIdx) => () => {
      setActivePanels(
        activePanels.includes(panelIdx)
          ? except(panelIdx, activePanels) // Remove the panel idx if expanded
          : [panelIdx, ...activePanels], // Add the panel idx if not expanded
      )
    },
    [activePanels],
  )

  return (
    <div className={classes.container}>
      <OnboardWizard
        title="Create your first Kubernetes cluster"
        body="Create your first Kubernetes cluster so you can start running some appications on it."
      >
        <ExpansionPanel
          expanded={activePanels.includes(1)}
          onClick={togglePanel(1)}
          stepNumber={1}
          completed
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
          expanded={activePanels.includes(2)}
          onClick={togglePanel(2)}
          stepNumber={2}
          summary="Access Your Cluster"
          completed
        >
          <Typography variant="body1" component="span">
            To access your cluster, you need to download the kubeconfig for your cluster and download <CodeBlock>kubectl</CodeBlock>
          </Typography>
          <NextButton showForward={false} onClick={handleAccessCluster}>
            Api Access
          </NextButton>
        </ExpansionPanel>
        <ExpansionPanel
          expanded={activePanels.includes(3)}
          onClick={togglePanel(3)}
          stepNumber={3}
          completed
          summary="Enable Monitoring For Your Cluster (Beta)"
        >
          <Typography variant="body1" component="span">
          Now that your cluster is created, enable monitoring to view the cluster’s health stats realtime in a dashboard
          </Typography>
        </ExpansionPanel>
      </OnboardWizard>
    </div>
  )
}

export default ClusterSetup
