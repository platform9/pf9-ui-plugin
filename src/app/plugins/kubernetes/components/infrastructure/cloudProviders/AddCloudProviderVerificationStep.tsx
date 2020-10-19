import React from 'react'
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
const objSwitchCaseAny: any = objSwitchCase // types on forward ref .js file dont work well.

const useStyles = makeStyles((theme: Theme) => ({
  wizardMeta: {
    marginTop: theme.spacing(4),
  },
  cpName: {
    color: theme.palette.grey['700'],
    paddingTop: theme.spacing(2),
  },
  form: {
    maxWidth: '800px',
    flexGrow: 1,
  },
}))

interface Props {
  wizardContext: any
  setWizardContext: any
}

// This step requires the cloud provider to have been created & have its ID
const AddCloudProviderVerificationStep = ({ wizardContext, setWizardContext }: Props) => {
  const classes = useStyles({})

  const ActiveForm = objSwitchCaseAny({
    [CloudProviders.Aws]: AwsCloudProviderVerification,
    [CloudProviders.Azure]: AzureCloudProviderVerification,
  })(wizardContext.provider)

  return (
    <Progress loading={!wizardContext.cloudProviderId}>
      <WizardMeta
        fields={wizardContext}
        icon={<CloudProviderCard active type={wizardContext.provider} />}
        className={classes.wizardMeta}
      >
        <div className={classes.form}>
          <ValidatedForm initialValues={wizardContext} elevated={false}>
            <Text variant="subtitle1" className={classes.cpName}>
              {wizardContext.name}
            </Text>
            <ActiveForm wizardContext={wizardContext} setWizardContext={setWizardContext} />
          </ValidatedForm>
        </div>
      </WizardMeta>
    </Progress>
  )
}

export default AddCloudProviderVerificationStep
