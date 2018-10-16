import React from 'react'
import Alert from 'core/common/Alert'
import ValidatedForm from 'core/common/ValidatedForm'
import PicklistField from 'core/common/PicklistField'
import SubmitButton from 'core/common/SubmitButton'
import TextField from 'core/common/TextField'
import createAddComponents from 'core/createAddComponents'
import { loadCloudProviders, createCloudProvider } from './actions'

const types = [
  { value: 'openstack', label: 'Openstack' },
  { value: 'aws', label: 'Amazon AWS Provider' },
]

const AWSHelpText = () => (
  <div>
    <p>
      Create a new cloud provider for your Amazon Web Services (AWS) public cloud.
      This cloud provider will work using your existing AWS credentials to create and
      manage Kubernetes clusters and associated resources within your AWS public
      cloud environment.
    </p>
    <p>
      You can create multiple AWS cloud providers - each AWS cloud provider should
      be associated with a unique set of AWS credentials.
    </p>
    <Alert variant="info">
      <div>
        <p>
          The following permissions are required on your AWS account in order to deploy
          fully automated Managed Kubernetes clusters:
        </p>
        <ul>
          <li>ELB Management</li>
          <li>Route 53 DNS Configuration</li>
          <li>Access to 2 or more Availability Zones within the region</li>
          <li>EC2 Instance Management</li>
          <li>EBS Volume Management</li>
          <li>VPC Management</li>
        </ul>
      </div>
    </Alert>
  </div>
)

const OpenstackHelpText = () => (
  <div>
    <p>
      Create a new cloud provider to work with an existing OpenStack endpoint. This
      cloud provider will work using your specified credentials for your OpenStack
      environment.
    </p>
    <p>
      You can create multiple OpenStack cloud providers - each OpenStack cloud provider
      should be associated with unique OpenStack credentials.
    </p>
    <Alert variant="info">
      <div>
        <p>
          The following services must be present in your OpenStack environment in
          order to deploy fully automated Managed Kubernetes clusters.
        </p>
        <ul>
          <li>Nova</li>
          <li>Cinder</li>
          <li>Neutron</li>
          <li>Heat</li>
        </ul>
      </div>
    </Alert>
  </div>
)

export class AddCloudProviderForm extends React.Component {
  state = {
    type: types[0].value,
  }

  setField = key => value => {
    this.setState({ [key]: value })
  }

  AWSFields = () => (
    <div>
      <AWSHelpText />
      <TextField id="name" label="Name" />
      <TextField id="key" label="AWS Access Key ID" />
      <TextField id="secret" label="Secret Key" />
    </div>
  )

  OpenstackFields = () => (
    <div>
      <OpenstackHelpText />
      <TextField id="name" label="Name" />
      <TextField id="authUrl" label="Keystone URL" />
      <TextField id="username" label="Username" />
      <TextField id="password" label="Password" />
      <TextField id="projectName" label="Project Name" />
      <h4>Advanced Settings</h4>
      <TextField id="userDomainName" label="User Domain Name" />
      <TextField id="projectDomainName" label="Project Domain Name" />
    </div>
  )

  render () {
    const { type } = this.state
    const { onComplete } = this.props
    return (
      <ValidatedForm onSubmit={onComplete}>
        <PicklistField id="type"
          label="Cloud Provider Type"
          onChange={this.setField('type')}
          options={types}
          initialValue={type}
        />
        {type === 'aws' && this.AWSFields()}
        {type === 'openstack' && this.OpenstackFields()}
        <SubmitButton>Add Cloud Provider</SubmitButton>
      </ValidatedForm>
    )
  }
}

export const options = {
  FormComponent: AddCloudProviderForm,
  createFn: createCloudProvider,
  loaderFn: loadCloudProviders,
  listUrl: '/ui/kubernetes/infrastructure#cloudProviders',
  name: 'AddCloudProvider',
  title: 'Add Cloud Provider',
}

const { AddPage } = createAddComponents(options)

export default AddPage
