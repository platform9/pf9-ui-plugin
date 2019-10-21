import React from 'react'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import SubmitButton from 'core/components/SubmitButton'
import Alert from 'core/components/Alert'
import { Typography } from '@material-ui/core'
import ExternalLink from 'core/components/ExternalLink'

const azureHowToUrl = 'https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal'
const signinHelpUrl = 'https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal#get-values-for-signing-in'
const createNewSecretUrl = 'https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal#create-a-new-application-secret'
const helpText = <Typography variant="body1" component="div">
  <p>
    Create a new cloud provider for your Microsoft Azure public cloud. This cloud provider will work
    using your existing Azure credentials to create and manage Kubernetes clusters and associated
    resources within your Azure public cloud environment.
  </p>
  <p>
    You can create multiple Azure cloud providers - each Azure cloud provider should be associated
    with a unique set of Azure credentials.
  </p>
  <Alert variant="info">
    <div>
      <p>
        To access resources that are secured by an Azure AD tenant, the entity that requires access
        must be represented by a new or existing security principal. The security principal defines
        the access policy and permissions for the user/application in the Azure AD tenant. In order
        to be able to perform the necessary operations on Managed Kubernetes clusters, your
        credentials must have a 'contributor' role assigned, or a similar read/write role where the
        user is able to access subscriptions, and create/update/delete Azure resources.
        See <ExternalLink url={azureHowToUrl}>this article</ExternalLink> for detailed steps.
      </p>
      <p>
        See the section under <ExternalLink url={signinHelpUrl}>get values for signing
        in</ExternalLink> to find the tenant and client IDs.
      </p>
      <p>
        A client secret must be present before creating an Azure cloud provider. To learn more about
        creating a client secret, see <ExternalLink url={createNewSecretUrl}>create a new
        application secret</ExternalLink>.
      </p>
    </div>
  </Alert>
</Typography>

const AddAzureCloudProvider = ({ onComplete }) => {
  return <>
    {helpText}
    <ValidatedForm onSubmit={onComplete}>
      <p>Specify Azure Credentials:</p>
      <TextField required id="name" label="Name" info="Name of the cloud provider" />
      <TextField required id="tenantId" label="Tenant ID" info="The tenant ID of the service principal" />
      <TextField required id="clientId" label="Client ID" info="The client ID of the service principal" />
      <TextField required id="secret" label="Client Secret" info="The client secret of the service principal" />
      <TextField required id="subscriptionId" label="Subscription ID" info="The ID of the subscription that correlates to the service principal." />
      <SubmitButton>Add Cloud Provider</SubmitButton>
    </ValidatedForm>
  </>
}

export default AddAzureCloudProvider
