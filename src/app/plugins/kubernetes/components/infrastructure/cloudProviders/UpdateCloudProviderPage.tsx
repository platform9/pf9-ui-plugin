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
import { CloudProviders } from './model'
const objSwitchCaseAny: any = objSwitchCase // types on forward ref .js file dont work well.

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'flex-start',
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
  container: {
    flexGrow: 1,
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

  const updatedInitialValues = useMemo(() => {
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
    <div className={classes.root}>
      {updatedInitialValues?.type && (
        <>
          <CloudProviderCard active={true} type={updatedInitialValues.type} />
          <div className={classes.container}>
            <Wizard
              onComplete={updateCloudProvider}
              context={updatedInitialValues}
              submitLabel="Save"
              showSteps={false}
              showFinishAndReviewButton={false}
              hideAllButtons={true}
            >
              {({ wizardContext, setWizardContext, onNext, handleNext }) => {
                return (
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
                            toggleIamPolicy={true}
                            showSubmitInCard={true}
                          />
                        </FormFieldCard>
                        <VerificationFields
                          wizardContext={wizardContext}
                          setWizardContext={setWizardContext}
                        />
                      </ValidatedForm>
                    </div>
                  </WizardStep>
                )
              }}
            </Wizard>
          </div>
        </>
      )}
    </div>
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
