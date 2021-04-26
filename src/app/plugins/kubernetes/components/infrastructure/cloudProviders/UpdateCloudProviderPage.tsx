import React, { useCallback, useMemo } from 'react'
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
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import clsx from 'clsx'
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
  spaceRight: {
    marginRight: theme.spacing(4),
  },
  checkIcon: {
    color: theme.palette.green[500],
    marginRight: theme.spacing(1),
    alignSelf: 'center',
  },
  timesIcon: {
    color: theme.palette.red[500],
    marginRight: theme.spacing(1),
    alignSelf: 'center',
  },
  calloutFields: {
    display: 'grid',
    gridGap: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
  },
  label: {
    display: 'grid',
    gridTemplateColumns: 'min-content 1fr',
  },
  value: {
    marginLeft: theme.spacing(4),
  },
  noneText: {
    color: theme.palette.grey[300],
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

const getAvailableText = (available) => (available ? 'Available' : 'Unavailable')

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

  const getAwsCalloutFields = useCallback((wizardContext) => {
    return [
      {
        label: `Regions ${getAvailableText(wizardContext.regionsAvailable)}`,
        available: wizardContext.regionsAvailable,
        value: wizardContext.regionOptionLabel,
      },
      {
        label: `Route 53 Domain ${getAvailableText(wizardContext.route53DomainsAvailable)}`,
        available: wizardContext.route53DomainsAvailable,
        value: wizardContext.awsDomainOptionLabel,
      },
      {
        label: `SSH Keys ${getAvailableText(wizardContext.sshKeysAvailable)}`,
        available: wizardContext.sshKeysAvailable,
        value: wizardContext.sshKey,
      },
    ]
  }, [])

  const getAzureCalloutFields = useCallback((wizardContext) => {
    return [
      {
        label: `Regions ${getAvailableText(wizardContext.regionsAvailable)}`,
        available: wizardContext.regionsAvailable,
        value: wizardContext.regionOptionLabel,
      },
    ]
  }, [])

  const getCalloutFields = useCallback(
    (wizardContext) => {
      return initialValues.type === CloudProviders.Aws
        ? getAwsCalloutFields(wizardContext)
        : getAzureCalloutFields(wizardContext)
    },
    [initialValues.type],
  )

  const renderCustomCalloutFields = useCallback(
    (wizardContext) => {
      const calloutFields = getCalloutFields(wizardContext)
      return (
        <div>
          {calloutFields.map(({ label, available, value }) => {
            const icon = available ? 'check-circle' : 'times-circle'
            const iconClass = available ? 'checkIcon' : 'timesIcon'
            return (
              <div key={label} className={classes.calloutFields}>
                <div className={classes.label}>
                  <FontAwesomeIcon className={classes[iconClass]} solid>
                    {icon}
                  </FontAwesomeIcon>
                  <Text variant="body2" className={classes.spaceRight}>
                    {label}
                  </Text>
                </div>
                <Text
                  variant="caption1"
                  className={clsx(classes.value, value ? '' : classes['noneText'])}
                >
                  {value || 'none'}
                </Text>
              </div>
            )
          })}
        </div>
      )
    },
    [getCalloutFields],
  )

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
            console.log('wizardContext', wizardContext)
            return (
              <WizardMeta
                className={classes.updateCloudProvider}
                fields={wizardContext}
                icon={<CloudProviderCard active type={wizardContext.type} />}
                extraSidebarContent={renderCustomCalloutFields(wizardContext)}
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
                          toggleIamPolicy
                          showSubmitInCard
                          updateWizard
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
  listUrl: routes.cloudProviders.list.path(),
  name: 'UpdateCloudProvider',
  title: 'Update Cloud Provider',
  uniqueIdentifier: 'uuid',
  cacheKey: ActionDataKeys.CloudProviders,
}

const { UpdatePage } = createUpdateComponents(options)

export default UpdatePage
