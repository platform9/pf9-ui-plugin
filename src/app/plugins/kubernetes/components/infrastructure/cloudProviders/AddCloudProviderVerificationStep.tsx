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
const objSwitchCaseAny: any = objSwitchCase // types on forward ref .js file dont work well.

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'flex-start',
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
  card: {
    margin: theme.spacing(1, 1.5),
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
      <div className={classes.root}>
        <CloudProviderCard active={true} type={wizardContext.provider} className={classes.card} />
        <div className={classes.form}>
          <ValidatedForm initialValues={wizardContext} elevated={false}>
            <Text variant="subtitle1" className={classes.cpName}>
              {wizardContext.name}
            </Text>
            <ActiveForm wizardContext={wizardContext} setWizardContext={setWizardContext} />
          </ValidatedForm>
        </div>
      </div>
    </Progress>
  )
}

export default AddCloudProviderVerificationStep
