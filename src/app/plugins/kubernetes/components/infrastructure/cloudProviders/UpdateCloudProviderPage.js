import React from 'react'
import createUpdateComponents from 'core/helpers/createUpdateComponents'
import SubmitButton from 'core/components/SubmitButton'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import { cloudProviderActions } from 'k8s/components/infrastructure/cloudProviders/actions'

const AWSFields = () => (
  <React.Fragment>
    <TextField id="key" label="AWS Access Key ID" />
    <TextField id="secret" label="Secret Key" />
  </React.Fragment>
)

const OpenstackFields = () => (
  <React.Fragment>
    <TextField id="username" label="Username" />
    <TextField id="password" label="Password" />
  </React.Fragment>
)

export const UpdateCloudProviderForm = ({ onComplete, initialValues }) => (
  <ValidatedForm onSubmit={onComplete} initialValues={initialValues}>
    <TextField id="name" label="Name" />
    {initialValues.type === 'aws' && <AWSFields />}
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
