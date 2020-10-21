import React from 'react'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Name from '../../form-components/name'
import CloudProvider from '../../form-components/cloud-provider'
import { CloudProviders } from 'k8s/components/infrastructure/cloudProviders/model'
import TextField from 'core/components/validatedForm/TextField'
import { customValidator } from 'core/utils/fieldValidators'
import { isKeyValid } from 'ssh-pub-key-validation'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { azurePrerequisitesLink } from 'k8s/links'
import Text from 'core/elements/text'
import ExternalLink from 'core/components/ExternalLink'

export const templateTitle = 'One Click'

const sshKeyValidator = customValidator((value) => {
  return isKeyValid(value)
}, 'You must enter a valid SSH key')

const OneClickAzureCluster = (wizardContext, setWizardContext, params, getParamsUpdater) => {
  return (
    <>
      <ValidatedForm
        initialValues={wizardContext}
        onSubmit={setWizardContext}
        // triggerSubmit={onNext}
        title="One-Click Cluster Setup"
      >
        <FormFieldCard
          title="Cluster Configuration"
          link={
            <ExternalLink url={azurePrerequisitesLink}>
              <Text variant="caption2">Azure Cluster Help</Text>
            </ExternalLink>
          }
        >
          <Name setWizardContext></Name>

          {/* Cloud Provider and Region */}
          <CloudProvider
            cloudProviderType={CloudProviders.Azure}
            wizardContext
            setWizardContext
            params
            getParamsUpdater
          ></CloudProvider>

          {/* SSH Key */}
          <TextField
            id="sshKey"
            label="Public SSH key"
            info="Copy/paste your SSH public key"
            size="small"
            validations={[sshKeyValidator]}
            multiline
            rows={3}
            required
          />
        </FormFieldCard>
      </ValidatedForm>
    </>
  )
}

export default OneClickAzureCluster
