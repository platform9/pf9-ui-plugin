import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Theme } from '@material-ui/core'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import ExternalLink from 'core/components/ExternalLink'
import CloudProviderCard from 'k8s/components/common/CloudProviderCard'
import AwsCloudProviderFields from './AwsCloudProviderFields'
import AzureCloudProviderFields from './AzureCloudProviderFields'
import GoogleCloudProviderFields from './GoogleCloudProviderFields'
import { awsPrerequisitesLink, azurePrerequisitesLink, googlePrerequisitesLink } from 'k8s/links'
import { objSwitchCase } from 'utils/fp'
import { cloudProviderActions } from './actions'
import Text from 'core/elements/text'
import { CloudProviders, CloudProvidersFriendlyName } from './model'
import TestsDialog, { TestStatus } from './tests-dialog'
import { clone } from 'ramda'
import useReactRouter from 'use-react-router'
import { routes } from 'core/utils/routes'
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
  [CloudProviders.Aws]: (
    <ExternalLink url={awsPrerequisitesLink}>
      <Text variant="caption2">Need help setting up an AWS provider?</Text>
    </ExternalLink>
  ),
  [CloudProviders.Azure]: (
    <ExternalLink url={azurePrerequisitesLink}>
      <Text variant="caption2">Need help setting up an Azure provider?</Text>
    </ExternalLink>
  ),
  [CloudProviders.GKE]: (
    <ExternalLink url={googlePrerequisitesLink}>
      <Text variant="caption2">Need help setting up a Google provider?</Text>
    </ExternalLink>
  ),
}

const testsForAws = [{ name: 'AWS account access', status: null }]

const testsForAzure = [{ name: 'Azure account access', status: null }]

const testsForGoogle = [{ name: 'Google account access', status: null }]

const requiredTests = {
  [CloudProviders.Aws]: testsForAws,
  [CloudProviders.Azure]: testsForAzure,
  [CloudProviders.GKE]: testsForGoogle,
}

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
  } else if (wizardContext.provider === CloudProviders.GKE) {
    try {
      const parseableString = wizardContext.json.replace(/[^\S\r\n]/g, ' ')
      const json = JSON.parse(parseableString)
      return {
        ...json,
        type: CloudProviders.GKE,
        name: wizardContext.name,
        account_type: json.type,
      }
    } catch (err) {
      console.error(err)
      return {}
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
  const [tests, setTests] = useState(requiredTests[wizardContext.provider])
  const [showDialog, setShowDialog] = useState(false)
  const [verified, setVerified] = useState(false)
  const validatorRef = useRef(null)
  const { history } = useReactRouter()

  const setupValidator = (validate) => {
    validatorRef.current = { validate }
  }

  const updateTestStatus = useCallback(
    (testIndex, status: TestStatus) => {
      const newTests = clone(tests)
      if (newTests[testIndex]) {
        newTests[testIndex].status = status
      }
      setTests(newTests)
    },
    [tests],
  )

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
      updateTestStatus(0, TestStatus.Loading)
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
      updateTestStatus(0, TestStatus.Fail)
      return false
    }

    setSubmitting(false)
    updateTestStatus(0, TestStatus.Success)
    setVerified(true)
    return false
  }, [wizardContext, tests])

  useEffect(() => {
    setTests(requiredTests[wizardContext.provider])
  }, [wizardContext.provider])

  useEffect(() => {
    // submitStep will always return false and prevent the user from
    // proceeding to the next step because we only want to move on to
    // the next step when the user closes the TestsDialog box
    onNext(submitStep)
  }, [submitStep])

  const handleClose = () => {
    if (verified) {
      // GKE has nothing to verify, just return to cloud providers page
      if (wizardContext.provider === CloudProviders.GKE) {
        history.push(routes.cloudProviders.list.path())
      }
      // Move on to the next step
      onNext()
      handleNext()
    } else {
      setShowDialog(false)
      setErrorMessage('')
      // Reset the tests and its statuses
      setTests(requiredTests[wizardContext.provider])
    }
  }

  const ActiveForm = useMemo(() => {
    return objSwitchCaseAny({
      [CloudProviders.Aws]: AwsCloudProviderFields,
      [CloudProviders.Azure]: AzureCloudProviderFields,
      [CloudProviders.GKE]: GoogleCloudProviderFields,
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
        <CloudProviderCard
          active={wizardContext.provider === CloudProviders.GKE}
          onClick={(value) => setWizardContext({ provider: value })}
          type={CloudProviders.GKE}
        />
      </div>
      {wizardContext.provider && (
        <ValidatedForm
          initialValues={wizardContext}
          onSubmit={setWizardContext}
          triggerSubmit={setupValidator}
          title={title}
          link={links[wizardContext.provider]}
          maxWidth={800}
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
