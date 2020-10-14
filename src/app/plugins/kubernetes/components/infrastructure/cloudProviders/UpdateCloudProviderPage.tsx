import React, { useMemo } from 'react'
import createUpdateComponents from 'core/helpers/createUpdateComponents'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { cloudProviderActions } from 'k8s/components/infrastructure/cloudProviders/actions'
import { ActionDataKeys } from 'k8s/DataKeys'
import AwsCloudProviderVerification from './AwsCloudProviderVerification'
import AzureCloudProviderVerification from './AzureCloudProviderVerification'
import { objSwitchCase } from 'utils/fp'
import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import CloudProviderCard from 'k8s/components/common/CloudProviderCard'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import AwsCloudProviderFields from './AwsCloudProviderFields'
import AzureCloudProviderFields from './AzureCloudProviderFields'
import Text from 'core/elements/text'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { CloudProviders, ICloudProvidersSelector } from './model'
import DocumentMeta from 'core/components/DocumentMeta'
import WizardMeta from 'core/components/wizard/WizardMeta'
const objSwitchCaseAny: any = objSwitchCase // types on forward ref .js file dont work well.

const useStyles = makeStyles((theme: Theme) => ({
  updateCloudProvider: {
    marginTop: 24,
  },
  cpName: {
    fontSize: 21,
    fontWeight: 600,
    color: theme.palette.grey['700'],
    paddingTop: theme.spacing(2),
  },
  form: {
    maxWidth: '800px',
    flexGrow: 1,
  },
  updateFields: {
    padding: theme.spacing(2, 3),
    border: `1px solid ${theme.palette.grey['300']}`,
    marginTop: theme.spacing(2),
    color: theme.palette.grey['700'],
    display: 'flex',
    flexFlow: 'column wrap',
  },
  field: {
    margin: theme.spacing(2, 0, 1),
    maxWidth: 'none',
  },
}))

const formCpBody = (data) => {
  if (data.type === CloudProviders.Aws) {
    return {
      name: data.name,
      key: data.awsAccessKey,
      secret: data.awsSecretKey,
    }
  } else if (data.type === CloudProviders.Azure) {
    return {
      type: data.type,
      name: data.name,
      clientId: data.clientId,
      clientSecret: data.clientSecret,
      tenantId: data.tenantId,
      subscriptionId: data.subscriptionId,
    }
  }
  return {}
}

export const UpdateCloudProviderForm = ({ onComplete, initialValues }) => {
  const classes = useStyles({})

  const updatedInitialValues: ICloudProvidersSelector = useMemo(() => {
    return {
      ...initialValues,
      cloudProviderId: initialValues.uuid,
    }
  }, [initialValues.uuid])

  const updateCloudProvider = (data) => {
    const body = formCpBody(data)
    return onComplete(body)
  }

  const VerificationFields = useMemo(() => {
    return objSwitchCaseAny({
      [CloudProviders.Aws]: AwsCloudProviderVerification,
      [CloudProviders.Azure]: AzureCloudProviderVerification,
    })(initialValues.type)
  }, [initialValues.type])

  const UpdateForm = useMemo(() => {
    return objSwitchCaseAny({
      [CloudProviders.Aws]: AwsCloudProviderFields,
      [CloudProviders.Azure]: AzureCloudProviderFields,
    })(initialValues.type)
  }, [initialValues.type])

  return (
    <>
      <DocumentMeta title="Update Cloud Provider" bodyClasses={['form-view']} />
      {updatedInitialValues?.type && (
        <Wizard
          onComplete={updateCloudProvider}
          context={updatedInitialValues}
          submitLabel="Save"
          showSteps={false}
          showFinishAndReviewButton={false}
          hideAllButtons
        >
          {({ wizardContext, setWizardContext, onNext, handleNext }) => {
            return (
              <WizardMeta
                className={classes.updateCloudProvider}
                fields={wizardContext}
                calloutFields={['name', 'type', 'descriptiveType']}
                icon={<CloudProviderCard active type={wizardContext.type} />}
              >
                <WizardStep stepId="step1" label="Update Cloud Provider">
                  <div className={classes.form}>
                    <ValidatedForm
                      initialValues={wizardContext}
                      elevated={false}
                      onSubmit={handleNext}
                    >
                      <Text variant="subtitle1" className={classes.cpName}>
                        {wizardContext.name}
                      </Text>
                      <FormFieldCard className={classes.field}>
                        <UpdateForm
                          wizardContext={wizardContext}
                          setWizardContext={setWizardContext}
                          toggleIamPolicy
                          showSubmitInCard
                        />
                      </FormFieldCard>
                      <VerificationFields
                        wizardContext={wizardContext}
                        setWizardContext={setWizardContext}
                      />
                    </ValidatedForm>
                  </div>
                </WizardStep>
              </WizardMeta>
            )
          }}
        </Wizard>
      )}
    </>
  )
}

export const options = {
  FormComponent: UpdateCloudProviderForm,
  updateFn: cloudProviderActions.update,
  loaderFn: cloudProviderActions.list,
  listUrl: '/ui/kubernetes/infrastructure#cloudProviders',
  name: 'UpdateCloudProvider',
  title: 'Update Cloud Provider',
  uniqueIdentifier: 'uuid',
  cacheKey: ActionDataKeys.CloudProviders,
}

const { UpdatePage } = createUpdateComponents(options)

export default UpdatePage
