import React, { useMemo } from 'react'
import createUpdateComponents from 'core/helpers/createUpdateComponents'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { cloudProviderActions } from 'k8s/components/infrastructure/cloudProviders/actions'
import { ActionDataKeys } from 'k8s/DataKeys'
import AwsCloudProviderVerification from './AwsCloudProviderVerification'
import AzureCloudProviderVerification from './AzureCloudProviderVerification'
import { objSwitchCase, onlyDefinedValues } from 'utils/fp'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
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
import { pick } from 'ramda'
import { routes } from 'core/utils/routes'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { cloudVerificationCalloutFields, renderVerificationCalloutFields } from './helpers'
import { UserPreferences } from 'app/constants'
import GoogleCloudProviderVerification from './GoogleCloudProviderVerification'
import GoogleCloudProviderFields from './GoogleCloudProviderFields'
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
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
}))

const formCpBody = (data) => {
  // Do not accept empty strings for these properties
  // User may type and then delete the input before submitting
  if (data.type === CloudProviders.Aws) {
    return pick(['key', 'secret'], onlyDefinedValues(data))
  } else if (data.type === CloudProviders.Azure) {
    return pick(['clientId', 'clientSecret', 'tenantId', 'subscriptionId'], onlyDefinedValues(data))
  }
  return {}
}

export const UpdateCloudProviderForm = ({ onComplete, initialValues }) => {
  const classes = useStyles({})
  const [prefs, , , updateUserDefaults] = useScopedPreferences('defaults')

  const cloudDefaults = useMemo(() => {
    return (
      objSwitchCaseAny({
        [CloudProviders.Aws]: prefs[UserPreferences.Aws],
        [CloudProviders.Azure]: prefs[UserPreferences.Azure],
      })(initialValues.type) || {}
    )
  }, [initialValues.type, prefs])

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
      [CloudProviders.Gcp]: GoogleCloudProviderVerification,
    })(initialValues.type)
  }, [initialValues.type])

  const UpdateForm = useMemo(() => {
    return objSwitchCaseAny({
      [CloudProviders.Aws]: AwsCloudProviderFields,
      [CloudProviders.Azure]: AzureCloudProviderFields,
      [CloudProviders.Gcp]: GoogleCloudProviderFields,
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
                fields={{ ...wizardContext, ...cloudDefaults }}
                calloutFields={cloudVerificationCalloutFields(wizardContext.type)}
                renderLabels={renderVerificationCalloutFields()}
                icon={<CloudProviderCard active type={wizardContext.type} />}
                showUndefinedFields
              >
                <WizardStep stepId="step1" label="Update Cloud Provider">
                  <div className={classes.form}>
                    <ValidatedForm
                      classes={{ root: classes.validatedFormContainer }}
                      initialValues={wizardContext}
                      elevated={false}
                      onSubmit={handleNext}
                      maxWidth={800}
                    >
                      <Text variant="subtitle1" className={classes.cpName}>
                        {wizardContext.name}
                      </Text>
                      <FormFieldCard>
                        <UpdateForm
                          wizardContext={wizardContext}
                          setWizardContext={setWizardContext}
                          showInfo={wizardContext.type === CloudProviders.Aws}
                          toggleIamPolicy
                          showSubmitInCard
                          updateWizard
                          setDefaultValueForTextfields
                        />
                      </FormFieldCard>
                    </ValidatedForm>
                    <ValidatedForm
                      classes={{ root: classes.validatedFormContainer }}
                      initialValues={wizardContext}
                      elevated={false}
                      maxWidth={800}
                    >
                      <VerificationFields
                        wizardContext={wizardContext}
                        setWizardContext={setWizardContext}
                        updateUserDefaults={updateUserDefaults}
                        cloudDefaults={cloudDefaults}
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
  listUrl: routes.cloudProviders.list.path(),
  name: 'UpdateCloudProvider',
  title: 'Update Cloud Provider',
  uniqueIdentifier: 'uuid',
  cacheKey: ActionDataKeys.CloudProviders,
}

const { UpdatePage } = createUpdateComponents(options)

export default UpdatePage
