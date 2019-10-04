import React from 'react'
// import Checkbox from 'core/components/validatedForm/CheckboxField'
// import ExternalLink from 'core/components/ExternalLink'
import FormWrapper from 'core/components/FormWrapper'
// import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
// import NodesChooser from './NodesChooser'
import AwsAvailabilityZoneChooser from './AwsAvailabilityZoneChooser'
import AwsRegionFlavorPicklist from './AwsRegionFlavorPicklist'
import CloudProviderPicklist from 'k8s/components/common/CloudProviderPicklist'
import CloudProviderRegionPicklist from 'k8s/components/common/CloudProviderRegionPicklist'
import AwsClusterSshKeyPicklist from './AwsClusterSshKeyPicklist'
import ClusterDomainPicklist from './ClusterDomainPicklist'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
// import useDataLoader from 'core/hooks/useDataLoader'
import useParams from 'core/hooks/useParams'
// import { projectAs } from 'utils/fp'
// import { cloudProviderActions } from './actions'
// import { propEq } from 'ramda'

const initialContext = {
  template: 'small',
  ami: 'ubuntu',
  masterFlavor: 't2.small',
  workerFlavor: 't2.small',
  numMasters: 1,
  numWorkers: 1,
  enableCAS: false,
  usePf9Domain: true,
  vpcOption: 'newVpc',
  containersCidr: '10.20.0.0/16',
  servicesCidr: '10.21.0.0/16',
}

const templateOptions = [
  { label: 'small (single dev) - 1 node master + worker (t2.small)', value: 'small' },
  { label: 'medium (internal team) - 1 master + 3 workers (t2.medium)', value: 'medium' },
  { label: 'large (production) - 3 masters + 5 workers (t2.large)', value: 'large' },
]

const operatingSystemOptions = [
  { label: 'Ubuntu', value: 'ubuntu' },
  { label: 'CentOS', value: 'centos' },
]

const numMasterOptions = [
  { label: '1', value: 1 },
  { label: '3', value: 3 },
  { label: '5', value: 5 },
]

// The template picker allows the user to fill out some useful defaults for the fields.
// This greatly simplifies the number of fields that need to be filled out.
// Presets are as follows:
// small (single dev) - 1 node master + worker - select instance type (default t2.small)
// medium (internal team) - 1 master + 3 workers - select instance (default t2.medium)
// large (production) - 3 master + 5 workers - no workload on masters (default t2.large)
const handleTemplateChoice = ({ setWizardContext, setFieldValue }) => option => {
  const options = {
    small: {
      numMasters: 1,
      numWorkers: 0,
      allowWorkloadsOnMaster: true,
      masterFlavor: 't2.small',
      workerFlavor: 't2.small',
    },
    medium: {
      numMasters: 1,
      numWorkers: 3,
      allowWorkloadsOnMaster: false,
      masterFlavor: 't2.medium',
      workerFlavor: 't2.medium',
    },
    large: {
      numMasters: 3,
      numWorkers: 5,
      allowWorkloadsOnMaster: false,
      masterFlavor: 't2.large',
      workerFlavor: 't2.large',
    }
  }

  if (!options[option]) return
  setWizardContext(options[option])
  Object.entries(options[option]).forEach(([key, value]) => {
    setFieldValue(key)(value)
  })

  // set common default settings
  // TODO: Choose the first AZ by default
}

const vpcOptions = [
  { label: '+ Create new VPC', value: 'newVpc' },
  { label: 'Use existing VPC', value: 'existing' },
  { label: 'Use existing VPC with VPN', value: 'existingNewVpn' },
]

const renderVpcFields = (vpcOption) => {
  switch (vpcOption) {
    case 'newVpc':
      return (
        <CheckboxField
          id="isPrivate"
          label="Deploy nodes using private subnet"
          info=""
        />
      )
    case 'existing':
      return (
        <div>
          {/* TODO: public subnets for each AZ */}
          <CheckboxField
            id="isPrivate"
            label="Deploy nodes using private subnet"
            info=""
          />
          {/* TODO: private subnets for each AZ if isPrivate */}
        </div>
      )
    case 'existingNewVpn':
      return (
        <div>TODO</div>
      )
  }
}

const networkPluginOptions = [
  { label: 'Flannel', value: 'flannel' },
  { label: 'Calico', value: 'calico' },
  { label: 'Canal (experimental)', value: 'canal' },
]

const handleNetworkPluginChange = ({ setWizardContext, setFieldValue }) => option => {
  if (['calico', 'canal', 'weave'].includes(option)) {
    setWizardContext({ privileged: true })
    setFieldValue('privileged')(true)
  }
}

// These fields are only rendered when the user opts to not use a `platform9.net` domain.
const renderCustomNetworkingFields = ({ params, values }) => {
  const updateFqdns = () => {
    // TODO: When the domain changes, update the API and services FQDN
  }

  return (
    <>
      <PicklistField
        DropdownComponent={ClusterDomainPicklist}
        id="domainId"
        label="Domain"
        cloudProviderId={params.cloudProviderId}
        onChange={updateFqdns}
        cloudProviderRegionId={params.cloudProviderRegionId}
        info="Select the base domain name to be used for the API and service FQDNs"
        required
      />

      <PicklistField
        id="vpcOption"
        label="VPC Network"
        options={vpcOptions}
        info="Select a network configuration. Read this article for detailed information about each network configuration type."
        notAsync
      />
      {renderVpcFields(values.vpcOption, {})}
    </>
  )
}

const handleSubmit = () => {
  // TODO
}

const AddAwsClusterPage = () => {
  const { params, getParamsUpdater } = useParams()

  return (
    <Wizard onComplete={handleSubmit} context={initialContext}>
      {({ wizardContext, setWizardContext, onNext }) => {
        return (
          <>
            <WizardStep stepId="basic" label="Basic Info">
              <FormWrapper title="Add Cluster">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext}>
                  {({ setFieldValue, values }) => (
                    <>
                      {/* Cluster Name */}
                      <TextField
                        id="name"
                        label="name"
                        info="Name of the cluster"
                        required
                      />

                      {/* Cloud Provider */}
                      <PicklistField
                        DropdownComponent={CloudProviderPicklist}
                        id="nodePoolUuid"
                        label="Cloud Provider"
                        onChange={getParamsUpdater('cloudProviderId')}
                        info="Nodes will be provisioned using this cloud provider."
                        value={params.cloudProviderId}
                        type="aws"
                        required
                      />

                      {/* AWS Region */}
                      <PicklistField
                        DropdownComponent={CloudProviderRegionPicklist}
                        disabled={!params.cloudProviderId}
                        id="region"
                        label="Region"
                        cloudProviderId={params.cloudProviderId}
                        onChange={getParamsUpdater('cloudProviderRegionId')}
                        info="Region "
                        value={params.cloudProviderRegionId}
                        type="aws"
                        required
                      />

                      {/* Template Chooser */}
                      <PicklistField
                        id="template"
                        label="Cluster Template"
                        options={templateOptions}
                        onChange={handleTemplateChoice({ setWizardContext, setFieldValue })}
                        info="Set common options from one of the available templates"
                      />

                      {/* AWS Availability Zone */}
                      <AwsAvailabilityZoneChooser
                        id="azs"
                        info="Select from the Availability Zones for the specified region"
                        cloudProviderId={params.cloudProviderId}
                        cloudProviderRegionId={params.cloudProviderRegionId}
                        required
                      />

                      {/* Operating System */}
                      <PicklistField
                        id="ami"
                        label="Operating System"
                        options={operatingSystemOptions}
                        info="Operating System / AMI"
                        required
                        notAsync
                      />

                      {/* CLUSTER CONFIGURATION STEP */}
                      {/* TODO: Leaving in first step for easier development.  Move this into its own step once we are done */}

                      {/* Workloads on masters */}
                      <CheckboxField
                        id="allowWorkloadsOnMaster"
                        label="Allow workloads on master nodes"
                        info="Check this box to enable workloads on master nodes. It is highly recommended to not enable workloads on master nodes for production or critical workload clusters."
                      />

                      {/* Master node instance type */}
                      <PicklistField
                        DropdownComponent={AwsRegionFlavorPicklist}
                        disabled={!(params.cloudProviderId && params.cloudProviderRegionId)}
                        id="masterFlavor"
                        label="Master Node Instance Type"
                        cloudProviderId={params.cloudProviderId}
                        cloudProviderRegionId={params.cloudProviderRegionId}
                        info="Choose an instance type used by master nodes."
                        required
                      />

                      {/* Num master nodes */}
                      <PicklistField
                        id="numMasters"
                        options={numMasterOptions}
                        label="Number of master nodes"
                        info="Number of master nodes to deploy.  3 nodes are required for an High Availability (HA) cluster."
                        required
                        notAsync
                      />

                      {/* Worker node instance type */}
                      <PicklistField
                        DropdownComponent={AwsRegionFlavorPicklist}
                        disabled={!(params.cloudProviderId && params.cloudProviderRegionId)}
                        id="workerFlavor"
                        label="Worker Node Instance Type"
                        cloudProviderId={params.cloudProviderId}
                        cloudProviderRegionId={params.cloudProviderRegionId}
                        info="Choose an instance type used by worker nodes."
                        required
                      />

                      {/* Num worker nodes */}
                      <TextField
                        id="numWorkers"
                        type="number"
                        label="Number of worker nodes"
                        info="Number of worker nodes to deploy."
                        required
                      />

                      {/* Enable Auto Scaling */}
                      <CheckboxField
                        id="enableCAS"
                        label="Enable Auto Scaling"
                        info="The cluster may scale up to the max worker nodes specified. Auto scaling may not be used with spot instances."
                      />

                      {values.enableCAS &&
                        <TextField
                          id="numMaxWorkers"
                          type="number"
                          label="Maximum number of worker nodes"
                          info="Maximum number of worker nodes this cluster may be scaled up to."
                          required={values.enableCAS}
                        />
                      }

                      {/* TODO: enable auto scaling, max number of worker nodes */}

                      {/* NETWORK INFO STEP */}
                      {/* TODO: Leaving in first step for easier development.  Move this into its own step once we are done */}

                      {/* Use PF9 domain */}
                      <CheckboxField
                        id="usePf9Domain"
                        label="Use the platform9.net domain"
                        info="Select this option if you want Platform9 to automatically generate the endpoints or if you do not have access to Route 53."
                      />

                      {values.usePf9Domain || renderCustomNetworkingFields({ params, values, setFieldValue, setWizardContext })}

                      {/* Containers CIDR */}
                      <TextField
                        id="containersCidr"
                        label="Containers CIDR"
                        info="Defines the network CIDR from which the flannel networking layer allocates IP addresses to Docker containers. This CIDR should not overlap with the VPC CIDR. Each node gets a /24 subnet. Choose a CIDR bigger than /23 depending on the number of nodes in your cluster. A /16 CIDR gives you 256 nodes."
                        required
                      />

                      {/* Services CIDR */}
                      <TextField
                        id="servicesCidr"
                        label="Services CIDR"
                        info="Defines the network CIDR from which Kubernetes allocates virtual IP addresses to Services.  This CIDR should not overlap with the VPC CIDR."
                        required
                      />

                      {/* HTTP proxy */}
                      <TextField
                        id="httpProxy"
                        label="HTTP Proxy"
                        info="Specify the HTTP proxy for this cluster.  Leave blank for none.  Uses format of <scheme>://<username>:<password>@<host>:<port> where <username>:<password>@ is optional."
                      />

                      {/* Network plugin */}
                      <PicklistField
                        id="networkPlugin"
                        label="Network backend"
                        options={networkPluginOptions}
                        info=""
                        onChange={handleNetworkPluginChange({ setWizardContext, setFieldValue })}
                        required
                        notAsync
                      />

                      {/* HTTP proxy */}
                      {values.networkPlugin === 'calico' &&
                        <TextField
                          id="mtuSize"
                          label="MTU Size"
                          info="Maximum Transmission Unit (MTU) for the interface (in bytes)"
                          required={values.networkPlugin === 'calico'}
                        />
                      }

                      {/* ADVANCED CONFIGURATION STEP */}
                      {/* TODO: Leaving in first step for easier development.  Move this into its own step once we are done */}

                      {/* SSH Key */}
                      <PicklistField
                        DropdownComponent={AwsClusterSshKeyPicklist}
                        disabled={!(params.cloudProviderId && params.cloudProviderRegionId)}
                        id="sshKey"
                        label="SSH Key"
                        cloudProviderId={params.cloudProviderId}
                        cloudProviderRegionId={params.cloudProviderRegionId}
                        info="Select an AWS SSH key to be associated with the nodes. This key can be used to access the nodes for debugging or other purposes."
                        required
                      />

                      {/* Privileged (TODO: disabled and set to true if networkPlugin is calico, canal, or weave) */}
                      <CheckboxField
                        id="privileged"
                        label="Privileged"
                        disabled={['calico', 'canal', 'weave'].includes(values.networkPlugin)}
                        info="Allows this cluster to run privileged containers. Read this article for more information."
                      />

                      {/* Advanced API Configuration (TODO) */}

                      {/* Enable Application Catalog */}
                      <CheckboxField
                        id="appCatalogEnabled"
                        label="Enable Application Catalog"
                        info="Enable the Helm Application Catalog on this cluster"
                      />

                      {/* Custom AMI */}
                      <TextField
                        id="customAmi"
                        label="Custom AMI ID"
                        info="Use a custom AMI (leave blank for none) to create cluster nodes with, in case our AMI defaults are not available for you."
                      />

                      {/* Tags */}
                      <KeyValuesField
                        id="tags"
                        label="Tags"
                        info="Add tag metadata to this cluster"
                      />
                    </>
                  )}

                </ValidatedForm>
              </FormWrapper>
            </WizardStep>

            <WizardStep stepId="config" label="Cluster Configuration">
              <FormWrapper title="Cluster Configuration">
                <ValidatedForm>
                  {/* TODO */}
                </ValidatedForm>
              </FormWrapper>
            </WizardStep>

            <WizardStep stepId="network" label="Network Info">
              <FormWrapper title="Network Info">
                <ValidatedForm>
                  {/* TODO */}
                </ValidatedForm>
              </FormWrapper>
            </WizardStep>

            <WizardStep stepId="advanced" label="Advanced Configuration">
              <FormWrapper title="Advanced Configuration">
                <ValidatedForm>
                  {/* TODO */}
                </ValidatedForm>
              </FormWrapper>
            </WizardStep>

            <WizardStep stepId="review" label="Review">
              <FormWrapper title="Review">
                <ValidatedForm>
                  {/* TODO */}
                </ValidatedForm>
              </FormWrapper>
            </WizardStep>
          </>
        )
      }}
    </Wizard>
  )
}

export default AddAwsClusterPage
