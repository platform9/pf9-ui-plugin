import { makeStyles } from '@material-ui/styles'
import { onboardingPodSetup } from 'app/constants'
import { useAppSelector } from 'app/store'
import ExpansionPanel from 'core/components/expansionPanel/ExpansionPanel'
import PollingData from 'core/components/PollingData'
import Button from 'core/elements/button'
import Text from 'core/elements/text'
import useListAction from 'core/hooks/useListAction'
import Theme from 'core/themes/model'
import { routes } from 'core/utils/routes'
import OnboardWizard from 'k8s/components/onboarding/OnboardWizard'
import React, { useCallback, useEffect, useState } from 'react'
import useReactRouter from 'use-react-router'
import { emptyObj } from 'utils/fp'
import { listPods } from '../pods/actions'
import { makePodsSelector } from '../pods/selectors'

const oneSecond = 1000

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    maxWidth: 800,
  },
}))

interface Props {
  onComplete: () => void
  initialPanel?: number
}

export const podSetupComplete = (pods: any[]) =>
  !!pods.length || !!localStorage.getItem(onboardingPodSetup)

enum Panels {
  CreatePod = 0,
}

const selector = makePodsSelector()

const PodSetup = ({ onComplete, initialPanel }: Props) => {
  const classes = useStyles({})
  const { history } = useReactRouter()

  const [loadedOnce, setLoadedOnce] = useState(false)

  const handleCreatePod = useCallback(() => {
    history.push(routes.pods.add.path())
  }, [])

  const handleSkipPods = useCallback(() => {
    localStorage.setItem(onboardingPodSetup, 'true')
    onComplete()
  }, [])

  const [activePanels, setActivePanels] = useState(
    new Set(initialPanel !== undefined ? [initialPanel] : []),
  )

  const [loadingPods, reloadPods] = useListAction(listPods, {
    loadingFeedback: false,
  })
  const pods = useAppSelector((state) => selector(state, emptyObj))
  const hasPods = podSetupComplete(pods)

  useEffect(() => {
    if (initialPanel !== undefined) {
      setActivePanels(new Set([initialPanel]))
    }
  }, [initialPanel])

  const togglePanel = useCallback(
    (panel) => () => {
      const newPanels = new Set(activePanels)
      const operation = activePanels.has(panel) ? 'delete' : 'add'
      newPanels[operation](panel)
      setActivePanels(newPanels)
    },
    [activePanels],
  )

  const handleReload = (ignoreCache?: boolean) => {
    if (!loadedOnce) {
      setLoadedOnce(true)
    }
    return reloadPods(ignoreCache)
  }

  if (!loadedOnce && loadingPods) {
    return null
  }

  return (
    <div className={classes.container}>
      {!hasPods && (
        <PollingData
          hidden
          loading={loadingPods}
          onReload={handleReload}
          refreshDuration={oneSecond * 30}
        />
      )}
      <OnboardWizard
        title="Launch your first container on the cluster"
        body="Launch a container on your newly created cluster to run a sample application."
        renderLinks={false}
      >
        <ExpansionPanel
          expanded={activePanels.has(Panels.CreatePod)}
          onClick={togglePanel(Panels.CreatePod)}
          stepNumber={1}
          completed={hasPods}
          summary="Create a sample pod on your cluster"
          onSkip={handleSkipPods}
          skipConfirmTitle="Skip the pod creation step in your getting started wizard?"
        >
          <Text variant="body2">
            Try out your first Kubernetes app by launching a sample pod on your cluster
          </Text>
          <br />
          <Button textVariant="body2" onClick={handleCreatePod}>
            Create Pod
          </Button>
        </ExpansionPanel>
      </OnboardWizard>
    </div>
  )
}

export default PodSetup
