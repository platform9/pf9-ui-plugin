import React, { useCallback, useState } from 'react'
import FormWrapper from 'core/components/FormWrapper'
import { routes } from 'core/utils/routes'
import useReactRouter from 'use-react-router'
import { rbacProfileBindingsActions } from '../actions'
import DocumentMeta from 'core/components/DocumentMeta'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import useDataUpdater from 'core/hooks/useDataUpdater'
import ClusterProfileSelection from './cluster-profile-selection'
import DriftAnalysisResult from './drift-analysis-result'

const initialContext = {
  profile: undefined,
  cluster: undefined,
  analysis: '',
}

const hideWizardButtons = (wizardContext, step: number) => {
  return step === 1
}

const DriftAnalysisPage = () => {
  const { history } = useReactRouter()
  const [submittingStep, setSubmittingStep] = useState(false)

  const onComplete = useCallback(
    (success) => success && history.push(routes.rbac.profiles.list.path()),
    [history],
  )

  const [updateProfileBindingAction, creating] = useDataUpdater(
    rbacProfileBindingsActions.create,
    onComplete,
  )

  return (
    <FormWrapper title="" loading={creating || submittingStep}>
      <DocumentMeta title="Deploy Profile" bodyClasses={['form-view']} />
      <Wizard
        hideAllButtons={hideWizardButtons}
        onComplete={updateProfileBindingAction}
        context={initialContext}
        showSteps={false}
      >
        {({ wizardContext, setWizardContext, onNext, handleNext }) => (
          <>
            <WizardStep stepId="step1" label="Select a Cluster">
              <ClusterProfileSelection
                wizardContext={wizardContext}
                setWizardContext={setWizardContext}
                onNext={onNext}
                handleNext={handleNext}
                setSubmitting={setSubmittingStep}
              />
            </WizardStep>
            <WizardStep stepId="step2" label="Impact Analysis">
              <DriftAnalysisResult wizardContext={wizardContext} />
            </WizardStep>
          </>
        )}
      </Wizard>
    </FormWrapper>
  )
}

export default DriftAnalysisPage
