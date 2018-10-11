import React from 'react'
import Alert from 'core/common/Alert'
import ValidatedForm from 'core/common/ValidatedForm'
import Picklist from 'core/common/Picklist'
import createAddComponents from 'core/createAddComponents'
import { loadCloudProviders, createCloudProvider } from './actions'

const types = [
  'Amazon AWS Provider',
  'Openstack',
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

export class AddCloudProviderForm extends React.Component {
  state = {
    type: types[0],
  }

  setField = key => value => { this.setState({ [key]: value }) }

  render () {
    const { type } = this.state
    const { onComplete } = this.props
    return (
      <ValidatedForm onSubmit={onComplete}>
        <Picklist name="type"
          label="Cloud Provider Type"
          value={type}
          onChange={this.setField('type')}
          options={types}
        />
        {type === 'Amazon AWS Provider' && <AWSHelpText />}
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
