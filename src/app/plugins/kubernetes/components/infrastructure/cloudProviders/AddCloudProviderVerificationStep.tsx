import React, { useMemo } from 'react'
import CloudProviderCard from 'k8s/components/common/CloudProviderCard'
import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import AwsCloudProviderVerification from './AwsCloudProviderVerification'
import AzureCloudProviderVerification from './AzureCloudProviderVerification'
import { objSwitchCase } from 'utils/fp'
import Progress from 'core/components/progress/Progress'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Text from 'core/elements/text'
import { CloudProviders } from './model'
import WizardMeta from 'core/components/wizard/WizardMeta'
import useScopedPreferences from 'core/session/useScopedPreferences'
import { cloudVerificationCalloutFields, renderVerificationCalloutFields } from './helpers'
import { routes } from 'core/utils/routes'
import Button from 'core/elements/button'
import { UserPreferences } from 'app/constants'
const objSwitchCaseAny: any = objSwitchCase // types on forward ref .js file dont work well.

const useStyles = makeStyles((theme: Theme) => ({
  cpName: {
    color: theme.palette.grey['700'],
    paddingTop: theme.spacing(2),
  },
  form: {
    maxWidth: '800px',
    flexGrow: 1,
  },
  validatedFormContainer: {
    display: 'grid',
    gridGap: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(2),
  },
}))

interface Props {
  wizardContext: any
  setWizardContext: any
  history: any
}

// This step requires the cloud provider to have been created & have its ID
const AddCloudProviderVerificationStep = ({ history, wizardContext, setWizardContext }: Props) => {
  const classes = useStyles({})
  const [prefs, , , updateUserDefaults] = useScopedPreferences('defaults')

  const cloudDefaults = useMemo(() => {
    return (
      objSwitchCaseAny({
        [CloudProviders.Aws]: prefs[UserPreferences.Aws],
        [CloudProviders.Azure]: prefs[UserPreferences.Azure],
      })(wizardContext.provider) || {}
    )
  }, [wizardContext.provider, prefs])

  const ActiveForm = objSwitchCaseAny({
    [CloudProviders.Aws]: AwsCloudProviderVerification,
    [CloudProviders.Azure]: AzureCloudProviderVerification,
  })(wizardContext.provider)

  return (
    <Progress loading={!wizardContext.cloudProviderId}>
      <WizardMeta
        fields={{ ...wizardContext, ...cloudDefaults }}
        calloutFields={cloudVerificationCalloutFields(wizardContext.provider)}
        renderLabels={renderVerificationCalloutFields()}
        icon={<CloudProviderCard active type={wizardContext.provider} />}
        showUndefinedFields
      >
        <div className={classes.form}>
          <ValidatedForm
            classes={{ root: classes.validatedFormContainer }}
            initialValues={wizardContext}
            elevated={false}
            maxWidth={800}
          >
            <Text variant="subtitle1" className={classes.cpName}>
              {wizardContext.name}
            </Text>
            <ActiveForm
              wizardContext={wizardContext}
              setWizardContext={setWizardContext}
              updateUserDefaults={updateUserDefaults}
              cloudDefaults={cloudDefaults}
            />
          </ValidatedForm>
          <Button
            className={classes.button}
            onClick={() => history.push(routes.cloudProviders.list.path())}
            type="submit"
          >
            Complete
          </Button>
        </div>
      </WizardMeta>
    </Progress>
  )
}

export default AddCloudProviderVerificationStep
