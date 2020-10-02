// import React, { useEffect, useState } from 'react'
import React, { useState } from 'react'
import useReactRouter from 'use-react-router'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import { routes } from 'core/utils/routes'
import AddCloudProviderCredentialStep from './AddCloudProviderCredentialStep'
import AddCloudProviderVerificationStep from './AddCloudProviderVerificationStep'
import FormWrapperDefault from 'core/components/FormWrapper'
const FormWrapper: any = FormWrapperDefault // types on forward ref .js file dont work well.

const formTitle = ({ provider }) => {
  if (provider === 'aws') {
    return 'Create AWS Cloud Provider'
  } else if (provider === 'azure') {
    return 'Create Azure Cloud Provider'
  }
  return 'Create Cloud Provider'
}

const AddCloudProviderPage = () => {
  const { history } = useReactRouter()
  const [submittingStep, setSubmittingStep] = useState(false)
  const submitLastStep = (params) => {
    history.push(routes.cloudProviders.edit.path().replace(':id', params.cloudProviderId))
  }

  const initialContext = {
    provider: new URLSearchParams(location.search).get('type') || 'aws',
  }

  return (
    <FormWrapper
      title="Add New Cloud Provider"
      backUrl={routes.cloudProviders.list.path()}
      loading={submittingStep}
    >
      <Wizard
        onComplete={submitLastStep}
        context={initialContext}
        hideBack={true}
        finishAndReviewLabel="Done"
      >
        {({ wizardContext, setWizardContext, onNext }) => {
          return (
            <>
              <WizardStep stepId="step1" label="Add Cloud Provider Credentials" keepContentMounted={false}>
                <AddCloudProviderCredentialStep
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                  onNext={onNext}
                  title={formTitle(wizardContext)}
                  setSubmitting={setSubmittingStep}
                />
              </WizardStep>
              <WizardStep stepId="step2" label="Cloud Provider Verification" keepContentMounted={false}>
                <AddCloudProviderVerificationStep
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                />
              </WizardStep>
            </>
          )
        }}
      </Wizard>
    </FormWrapper>
  )
}

export default AddCloudProviderPage
