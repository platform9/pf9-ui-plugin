// import React, { useEffect, useState } from 'react'
import React, { useState } from 'react'
import useReactRouter from 'use-react-router'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import { routes } from 'core/utils/routes'
import AddCloudProviderCredentialStep from './AddCloudProviderCredentialStep'
import AddCloudProviderVerificationStep from './AddCloudProviderVerificationStep'
import FormWrapperDefault from 'core/components/FormWrapper'
import { CloudProviders } from './model'
import DocumentMeta from 'core/components/DocumentMeta'
import Button from 'core/elements/button'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
const FormWrapper: any = FormWrapperDefault // types on forward ref .js file dont work well.

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    marginTop: theme.spacing(2),
  },
}))

export const formTitle = ({ provider }) => {
  if (provider === CloudProviders.Aws) {
    return 'Create AWS Cloud Provider'
  } else if (provider === CloudProviders.Azure) {
    return 'Create Azure Cloud Provider'
  } else if (provider === CloudProviders.Gcp) {
    return 'Create Google Cloud Provider'
  }
  return 'Create Cloud Provider'
}

const AddCloudProviderPage = () => {
  const classes = useStyles()
  const { history } = useReactRouter()
  const [submittingStep, setSubmittingStep] = useState(false)
  const submitLastStep = (params) => {
    history.push(routes.cloudProviders.edit.path({ id: params.cloudProviderId }))
  }

  const initialContext = {
    provider: new URLSearchParams(location.search).get('type') || CloudProviders.Aws,
  }

  return (
    <>
      <DocumentMeta title="Add Cloud Provider" bodyClasses={['form-view']} />
      <FormWrapper
        title="Add New Cloud Provider"
        backUrl={routes.cloudProviders.list.path()}
        loading={submittingStep}
      >
        <Wizard onComplete={submitLastStep} context={initialContext} hideBack={true} hideAllButtons>
          {({ wizardContext, setWizardContext, onNext, handleNext }) => {
            return (
              <>
                <WizardStep stepId="step1" label="Create Cloud Provider" keepContentMounted={false}>
                  <AddCloudProviderCredentialStep
                    wizardContext={wizardContext}
                    setWizardContext={setWizardContext}
                    onNext={onNext}
                    handleNext={handleNext}
                    title={formTitle(wizardContext)}
                    setSubmitting={setSubmittingStep}
                  />
                  <Button className={classes.button} onClick={handleNext} type="submit">
                    + Create Cloud Provider
                  </Button>
                </WizardStep>
                <WizardStep
                  stepId="step2"
                  label="Set Cloud Provider Defaults"
                  keepContentMounted={false}
                >
                  <AddCloudProviderVerificationStep
                    wizardContext={wizardContext}
                    setWizardContext={setWizardContext}
                    history={history}
                  />
                </WizardStep>
              </>
            )
          }}
        </Wizard>
      </FormWrapper>
    </>
  )
}

export default AddCloudProviderPage
