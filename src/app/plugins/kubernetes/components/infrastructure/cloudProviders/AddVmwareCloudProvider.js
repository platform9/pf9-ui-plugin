import React from 'react'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import SubmitButton from 'core/components/SubmitButton'
import Alert from 'core/components/Alert'
import { Typography } from '@material-ui/core'
import ExternalLink from 'core/components/ExternalLink'

const supportUrl = 'https://docs.platform9.com/getting-started/setup-guide-platform9-openstack-for-vmware-vsphere/'
const helpText = <Typography variant="body1" component="div">
  <p>
    Create a new cloud provider to work with an existing VMware deployment. Prior to creating this,
    Platform9 Managed OpenStack for VMware needs to be setup.
  </p>
  <p>
    To complete these steps, you can follow the steps in <ExternalLink url={supportUrl}>support
    article</ExternalLink>.
  </p>
  <Alert variant="info">
    <div>
      <p>
        The following services must be present in your OpenStack environment in order to deploy
        fully automated Managed Kubernetes clusters.
      </p>
      <ul>
        <li>Nova</li>
        <li>Cinder</li>
        <li>Neutron</li>
        <li>Heat</li>
        <li>DvSwitch</li>
        <li>DRS</li>
      </ul>
    </div>
  </Alert>
</Typography>

const keyStoneUrlInfo = <div>
  Provide the URL for the Keystone endpoint of your OpenStack deployment. Keystone is the
  OpenStack service that provides API client authentication. For example:
  https://company.platform9.net/keystone/v3.<br /><br />
  NOTE: We currently require that the OpenStack endpoint you use for this be a Platform9 Managed
  OpenStack endpoint. Contact support@platform9.com if you have any further questions about
  this
</div>

const initialValues = {
  type: 'vmware',
}

const AddVmwareCloudProvider = ({ onComplete }) => {
  return <>
    {helpText}
    <ValidatedForm onSubmit={onComplete} initialValues={initialValues}>
      <p>Specify OpenStack Credentials:</p>
      <TextField required id="name" label="Name" info="Name of the cloud provider" />
      <TextField required id="authUrl" label="Keystone URL" info={keyStoneUrlInfo} />
      <TextField required id="username" label="Username" info="Your OpenStack username" />
      <TextField required id="password" label="Password" info="Specify password for the OpenStack user specified above" />
      <TextField required id="projectName" label="Project Name"
        info="Provide name of the OpenStack Project (Tenant) you would like to use for this provider. The user credentials specified above should have access to and sufficient quota within the Project specified" />
      <h4>Advanced Settings</h4>
      <TextField required id="userDomainName" label="User Domain Name" initialValue="default"
        info="The domain that your OpenStack user belongs to" />
      <TextField required id="projectDomainName" label="Project Domain Name" initialValue="default"
        info="The project that your OpenStack user belongs to" />
      <SubmitButton>Add Cloud Provider</SubmitButton>
    </ValidatedForm>
  </>
}

export default AddVmwareCloudProvider
