import React, { useCallback } from 'react'
import ExpansionPanel from 'core/components/expansionPanel/ExpansionPanel'
import OnboardWizard from './onboard-wizard'
import NextButton from 'core/components/buttons/NextButton'
import useReactRouter from 'use-react-router'


const PodSetup = () => {
  const { history } = useReactRouter()

  const handleCreatePod = useCallback(() => {
    history.push('/ui/kubernetes/pods/add')
  }, [])

  return (
    <OnboardWizard
      title="Launch your first container on the cluster"
      body="Launch a container on your newly created cluster to run a sample application."
    >
      <ExpansionPanel
        stepNumber={1}
        completed={false}
        summary="Create a sample pod on your cluster"
      >
        <NextButton showForward={false} onClick={handleCreatePod}>
          Create Pod
        </NextButton>
      </ExpansionPanel>
    </OnboardWizard>
  )
}

export default PodSetup
