import React from 'react'
import createUpdateComponents from 'core/helpers/createUpdateComponents'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import { cloudProviderActions } from 'k8s/components/infrastructure/cloudProviders/actions'

const AWSFields = () => (
  <React.Fragment>
    <TextField id="key" label="AWS Access Key ID" />
    <TextField id="secret" label="Secret Key" type="password" />
  </React.Fragment>
)

const OpenstackFields = () => (
  <React.Fragment>
    <TextField id="username" label="Username" />
    <TextField id="password" label="Password" type="password" />
  </React.Fragment>
)

const AzureFields = () => (
  <>
    <TextField id="tenantId" label="Tenant ID" info="The tenant ID of the service principal" />
    <TextField id="clientId" label="Client ID" info="The client ID of the service principal" />
    <TextField id="clientSecret" type="password" label="Client Secret" info="The client secret of the service principal" />
    <TextField id="subscriptionId" label="Subscription ID" info="The ID of the subscription that correlates to the service principal." />
  </>
)

export const UpdateCloudProviderForm = ({ onComplete, initialValues }) => (
  <ValidatedForm onSubmit={onComplete} initialValues={initialValues}>
    <TextField id="name" label="Name" />
    {initialValues.type === 'aws' && <AWSFields />}
    {initialValues.type === 'azure' && <AzureFields />}
    {initialValues.type === 'openstack' && <OpenstackFields />}
    <SubmitButton>Update Cloud Provider</SubmitButton>
  </ValidatedForm>
)

export const options = {
  FormComponent: UpdateCloudProviderForm,
  updateFn: cloudProviderActions.update,
  loaderFn: cloudProviderActions.list,
  listUrl: '/ui/kubernetes/infrastructure#cloudProviders',
  name: 'UpdateCloudProvider',
  title: 'Update Cloud Provider',
  uniqueIdentifier: 'uuid',
  cacheKey: 'cloudProviders',
}

const { UpdatePage } = createUpdateComponents(options)

export default UpdatePage
