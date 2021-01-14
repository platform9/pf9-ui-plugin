import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import ExternalLink from 'core/components/ExternalLink'
import CloudProviderCard from 'k8s/components/common/CloudProviderCard'
import AwsCloudProviderFields from './AwsCloudProviderFields'
import AzureCloudProviderFields from './AzureCloudProviderFields'
import { awsPrerequisitesLink, azurePrerequisitesLink } from 'k8s/links'
import { objSwitchCase } from 'utils/fp'
import { cloudProviderActions } from './actions'
import Text from 'core/elements/text'
import { CloudProviders, CloudProvidersFriendlyName } from './model'
import TestsDialog, { TestStatus } from './tests-dialog'
const objSwitchCaseAny: any = objSwitchCase // types on forward ref .js file dont work well.

const useStyles = makeStyles((theme: Theme) => ({
  cloudProviderCards: {
    maxWidth: 800,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 242px)',
    gridGap: theme.spacing(2),
  },
  title: {
    marginTop: theme.spacing(4),
  },
}))

interface Props {
  wizardContext: any
  setWizardContext: any
  onNext: any
  handleNext: any
  title: string
  setSubmitting: any
}

const links = {
  aws: (
    <ExternalLink url={awsPrerequisitesLink}>
      <Text variant="caption2">Need help setting up an AWS provider?</Text>
    </ExternalLink>
  ),
  azure: (
    <ExternalLink url={azurePrerequisitesLink}>
      <Text variant="caption2">Need help setting up an Azure provider?</Text>
    </ExternalLink>
  ),
}

const requiredTests = (provider) =>
  new Map<string, TestStatus | null>([
    [`${CloudProvidersFriendlyName[provider]} account access`, null],
  ])

const formCpBody = (wizardContext) => {
  if (wizardContext.provider === CloudProviders.Aws) {
    return {
      type: wizardContext.provider,
      name: wizardContext.name,
      key: wizardContext.key,
      secret: wizardContext.secret,
    }
  } else if (wizardContext.provider === CloudProviders.Azure) {
    return {
      type: wizardContext.provider,
      name: wizardContext.name,
      clientId: wizardContext.clientId,
      clientSecret: wizardContext.clientSecret,
      tenantId: wizardContext.tenantId,
      subscriptionId: wizardContext.subscriptionId,
    }
  }
  return {}
}

const AddCloudProviderCredentialStep = ({
  wizardContext,
  setWizardContext,
  onNext,
  handleNext,
  title,
  setSubmitting,
}: Props) => {
  const classes = useStyles({})
  const [errorMessage, setErrorMessage] = useState('')
  const [tests, setTests] = useState(requiredTests(wizardContext.provider))
  const [showDialog, setShowDialog] = useState(false)
  const [verified, setVerified] = useState(false)
  const validatorRef = useRef(null)

  const setupValidator = (validate) => {
    validatorRef.current = { validate }
  }

  const updateTestStatus = (testName: string, status: TestStatus) => {
    const newTests = new Map(tests)
    newTests.set(testName, status)
    setTests(newTests)
  }

  const resetTestStatuses = () => {
    const newTests = new Map(tests)
    newTests.forEach((_, key) => newTests.set(key, null))
    setTests(newTests)
  }

  const submitStep = useCallback(async () => {
    const isValid = validatorRef.current.validate()
    if (!isValid) {
      return false
    }

    const provider = CloudProvidersFriendlyName[wizardContext.provider]
    setSubmitting(true)
    setShowDialog(true)
    const body = formCpBody(wizardContext)

    try {
      updateTestStatus(`${provider} account access`, TestStatus.Loading)
      const [success, newCp] = await cloudProviderActions.create(body)
      if (!success) {
        // TODO: surface the real API response error to get exact failure reason
        // Hopefully will be doable with Xan's error message changes
        throw `The provided credentials are not able to access your ${provider} account`
      }
      setWizardContext({ cloudProviderId: newCp.uuid })
    } catch (err) {
      setSubmitting(false)
      setErrorMessage(err)
      updateTestStatus(`${provider} account access`, TestStatus.Fail)
      return false
    }

    setSubmitting(false)
    updateTestStatus(`${provider} account access`, TestStatus.Success)
    setVerified(true)
    return false
  }, [wizardContext])

  useEffect(() => {
    // Reset the tests whenever cloud provider changes
    setTests(requiredTests(wizardContext.provider))
  }, [wizardContext.provider])

  useEffect(() => {
    // submitStep will always return false and prevent the user from
    // proceeding to the next step because we only want to move on to
    // the next step when the user closes the TestsDialog box
    onNext(submitStep)
  }, [submitStep])

  const handleClose = () => {
    if (verified) {
      // Move on to the next step
      onNext()
      handleNext()
    } else {
      setShowDialog(false)
      setErrorMessage('')
      resetTestStatuses()
    }
  }

  const ActiveForm = useMemo(() => {
    return objSwitchCaseAny({
      [CloudProviders.Aws]: AwsCloudProviderFields,
      [CloudProviders.Azure]: AzureCloudProviderFields,
    })(wizardContext.provider)
  }, [wizardContext.provider])

  return (
    <>
      <Text className={classes.title} variant="body1">
        Select a Cloud Provider Type:
      </Text>
      <div className={classes.cloudProviderCards}>
        <CloudProviderCard
          active={wizardContext.provider === CloudProviders.Aws}
          onClick={(value) => setWizardContext({ provider: value })}
          type={CloudProviders.Aws}
        />
        <CloudProviderCard
          active={wizardContext.provider === CloudProviders.Azure}
          onClick={(value) => setWizardContext({ provider: value })}
          type={CloudProviders.Azure}
        />
      </div>
      {wizardContext.provider && (
        <ValidatedForm
          initialValues={wizardContext}
          onSubmit={setWizardContext}
          triggerSubmit={setupValidator}
          title={title}
          link={links[wizardContext.provider]}
        >
          {({ setFieldValue, values }) => (
            <>
              <TestsDialog
                title="Validating Cloud Provider Access"
                subtitle="Testing your cloud providers access:"
                testsCompletionMessage="Cloud provider access test completed."
                tests={tests}
                showDialog={showDialog}
                onClose={handleClose}
                errorMessage={errorMessage}
                link={links[wizardContext.provider]}
              />
              <ActiveForm
                wizardContext={wizardContext}
                setWizardContext={setWizardContext}
                errorMessage={errorMessage}
              />
            </>
          )}
        </ValidatedForm>
      )}
    </>
  )
}

export default AddCloudProviderCredentialStep
