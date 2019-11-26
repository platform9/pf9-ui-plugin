import React from 'react'
import FormWrapper from 'core/components/FormWrapper'
import AwsAvailabilityZoneChooser from '../cloudProviders/AwsAvailabilityZoneChooser'
import AwsClusterReviewTable from './AwsClusterReviewTable'
import AwsRegionFlavorPicklist from './AwsRegionFlavorPicklist'
import AwsClusterVpcPicklist from './AwsClusterVpcPicklist'
import CloudProviderPicklist from 'k8s/components/common/CloudProviderPicklist'
import CloudProviderRegionPicklist from 'k8s/components/common/CloudProviderRegionPicklist'
import AwsClusterSshKeyPicklist from './AwsClusterSshKeyPicklist'
import ClusterDomainPicklist from './ClusterDomainPicklist'
import AwsZoneVpcMappings from './AwsZoneVpcMappings'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import KeyValuesField from 'core/components/validatedForm/KeyValuesField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useParams from 'core/hooks/useParams'
import useReactRouter from 'use-react-router'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { pathJoin } from 'utils/misc'
import { k8sPrefix } from 'app/constants'
import ExternalLink from 'core/components/ExternalLink'
import Code from 'core/components/CodeBlock'

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

const initialContext = {
  template: 'small',
  ami: 'ubuntu',
  masterFlavor: 't2.small',
  workerFlavor: 't2.small',
  numMasters: 1,
  numWorkers: 1,
  enableCAS: false,
  usePf9Domain: true,
  network: 'newPublic',
  containersCidr: '10.20.0.0/16',
  servicesCidr: '10.21.0.0/16',
  networkPlugin: 'flannel',
  mtuSize: 1440,
  runtimeConfigOption: 'default',
  isPrivate: false,
  internalElb: false,
}

const templateOptions = [
  { label: 'small - 1 node master + worker (t2.small)', value: 'small' },
  { label: 'medium - 1 master + 3 workers (t2.medium)', value: 'medium' },
  { label: 'large - 3 masters + 5 workers (t2.large)', value: 'large' },
  { label: 'custom', value: 'custom' },
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

const runtimeConfigOptions = [
  { label: 'Default API groups and versions', value: 'default' },
  { label: 'All API groups and versions', value: 'all' },
  { label: 'Custom', value: 'custom' },
]

// The template picker allows the user to fill out some useful defaults for the fields.
// This greatly simplifies the number of fields that need to be filled out.
// Presets are as follows:
// small (single dev) - 1 node master + worker - select instance type (default t2.small)
// medium (internal team) - 1 master + 3 workers - select instance (default t2.medium)
// large (production) - 3 master + 5 workers - no workload on masters (default t2.large)
const handleTemplateChoice = ({ setWizardContext, setFieldValue, paramUpdater }) => option => {
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
    },
    custom: {
      numMasters: 3,
      numWorkers: 5,
      allowWorkloadsOnMaster: false,
      masterFlavor: 't2.large',
      workerFlavor: 't2.large',
    },
  }

  paramUpdater(option)

  // setImmediate is used because we need the fields to show up in the form before their values can be set
  setImmediate(() => {
    setWizardContext(options[option])
    Object.entries(options[option]).forEach(([key, value]) => {
      setFieldValue(key)(value)
    })
  })
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

const networkOptions = [
  { label: 'Create new VPC (public)', value: 'newPublic' },
  { label: 'Create new VPC (public + private)', value: 'newPublicPrivate' },
  { label: 'Use existing VPC (public)', value: 'existingPublic' },
  { label: 'Use existing VPC (public + private)', value: 'existingPublicPrivate' },
  { label: 'Use existing VPC (private VPN only)', value: 'existingPrivate' },
]

// These fields are only rendered when the user opts to not use a `platform9.net` domain.
const renderCustomNetworkingFields = ({ params, getParamsUpdater, values, setFieldValue, setWizardContext, wizardContext }) => {
  const updateFqdns = (value, label) => {
    const name = values.name || wizardContext.name

    const api = `${name}-api.${label}`
    setFieldValue('externalDnsName')(api)
    setWizardContext({ externalDnsName: api })

    const service = `${name}-service.${label}`
    setFieldValue('serviceFqdn')(service)
    setWizardContext({ serviceFdqn: service })
  }

  const renderNetworkFields = networkOption => {
    switch (networkOption) {
      case 'newPublic':
      case 'newPublicPrivate':
        return null
      case 'existingPublic':
        return (
          <>
            <PicklistField
              DropdownComponent={AwsClusterVpcPicklist}
              id="vpc"
              label="VPC"
              azs={params.azs}
              onChange={getParamsUpdater('vpcId')}
              cloudProviderId={params.cloudProviderId}
              cloudProviderRegionId={params.cloudProviderRegionId}
              info=""
              required
            />

            <AwsZoneVpcMappings
              type="public"
              cloudProviderId={params.cloudProviderId}
              cloudProviderRegionId={params.cloudProviderRegionId}
              onChange={getParamsUpdater('subnets')}
              vpcId={params.vpcId}
              azs={params.azs}
            />
          </>
        )
      case 'existingPublicPrivate':
        return (
          <>
            <PicklistField
              DropdownComponent={AwsClusterVpcPicklist}
              id="vpc"
              label="VPC"
              azs={params.azs}
              onChange={getParamsUpdater('vpcId')}
              cloudProviderId={params.cloudProviderId}
              cloudProviderRegionId={params.cloudProviderRegionId}
              info=""
              required
            />

            <AwsZoneVpcMappings
              type="public"
              cloudProviderId={params.cloudProviderId}
              cloudProviderRegionId={params.cloudProviderRegionId}
              onChange={getParamsUpdater('subnets')}
              vpcId={params.vpcId}
              azs={params.azs}
            />

            <AwsZoneVpcMappings
              type="private"
              cloudProviderId={params.cloudProviderId}
              cloudProviderRegionId={params.cloudProviderRegionId}
              onChange={getParamsUpdater('privateSubnets')}
              vpcId={params.vpcId}
              azs={params.azs}
            />
          </>
        )
      case 'existingPrivate':
        return (
          <>
            <PicklistField
              DropdownComponent={AwsClusterVpcPicklist}
              id="vpc"
              label="VPC"
              azs={params.azs}
              onChange={getParamsUpdater('vpcId')}
              cloudProviderId={params.cloudProviderId}
              cloudProviderRegionId={params.cloudProviderRegionId}
              info=""
              required
            />

            <AwsZoneVpcMappings
              type="private"
              cloudProviderId={params.cloudProviderId}
              cloudProviderRegionId={params.cloudProviderRegionId}
              onChange={getParamsUpdater('privateSubnets')}
              vpcId={params.vpcId}
              azs={params.azs}
            />
          </>
        )
    }
  }

  return (
    <>
      <PicklistField
        DropdownComponent={ClusterDomainPicklist}
        id="domainId"
        label="Domain"
        onChange={updateFqdns}
        cloudProviderId={params.cloudProviderId}
        cloudProviderRegionId={params.cloudProviderRegionId}
        info="Select the base domain name to be used for the API and service FQDNs"
        required
      />

      <PicklistField
        id="network"
        label="Network"
        options={networkOptions}
        info={<div>Select a network configuration. Read <ExternalLink url="https://docs.platform9.com/kubernetes/networking/configurations-supported-aws-cloud-provider/">this article</ExternalLink> for detailed information about each network configuration type.</div>}
      />
      {renderNetworkFields(values.network)}
    </>
  )
}

const AddAwsClusterPage = () => {
  const { params, getParamsUpdater } = useParams()
  const { history } = useReactRouter()
  const onComplete = () => history.push('/ui/kubernetes/infrastructure#clusters')
  const [createAwsClusterAction, creatingAwsCluster] = useDataUpdater(clusterActions.create, onComplete)
  const handleSubmit = params => data => createAwsClusterAction({ ...data, ...params, clusterType: 'aws' })

  return (
    <FormWrapper title="Add AWS Cluster" backUrl={listUrl} loading={creatingAwsCluster}>
      <Wizard onComplete={handleSubmit(params)} context={initialContext} originPath={`${k8sPrefix}/infrastructure/clusters/add`} showFinishAndReviewButton>
        {({ wizardContext, setWizardContext, onNext }) => {
          return (
            <>
              <WizardStep stepId="config" label="Cluster Configuration">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  {({ setFieldValue, values }) => (
                    <>
                      {/* Cluster Name */}
                      <TextField
                        id="name"
                        label="Name"
                        info="Name of the cluster"
                        required
                      />

                      {/* Cloud Provider */}
                      <PicklistField
                        DropdownComponent={CloudProviderPicklist}
                        id="cloudProviderId"
                        label="Cloud Provider"
                        onChange={getParamsUpdater('cloudProviderId')}
                        info="Nodes will be provisioned using this cloud provider."
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

                      {/* AWS Availability Zone */}
                      {values.region &&
                      <AwsAvailabilityZoneChooser
                        id="azs"
                        info="Select from the Availability Zones for the specified region"
                        cloudProviderId={params.cloudProviderId}
                        cloudProviderRegionId={params.cloudProviderRegionId}
                        onChange={getParamsUpdater('azs')}
                        required
                      />
                      }

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

                      {/* Template Chooser */}
                      <PicklistField
                        id="template"
                        label="Cluster Template"
                        options={templateOptions}
                        onChange={handleTemplateChoice({ setWizardContext, setFieldValue, paramUpdater: getParamsUpdater('template') })}
                        info="Set common options from one of the available templates"
                      />

                      {params.template === 'custom' &&
                        <>
                          {/* Operating System */}
                          <PicklistField
                            id="ami"
                            label="Operating System"
                            options={operatingSystemOptions}
                            info="Operating System / AMI"
                            required
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

                          {/* Workloads on masters */}
                          <CheckboxField
                            id="allowWorkloadsOnMaster"
                            label="Allow workloads on master nodes"
                            info="It is highly recommended to not enable workloads on master nodes for production or critical workload clusters."
                          />

                          {/* Enable Auto Scaling */}
                          <CheckboxField
                            id="enableCAS"
                            label="Enable Auto Scaling"
                            info="The cluster may scale up to the max worker nodes specified. Auto scaling may not be used with spot instances."
                          />

                          {/* Max num worker nodes (autoscaling) */}
                          {values.enableCAS &&
                          <TextField
                            id="numMaxWorkers"
                            type="number"
                            label="Maximum number of worker nodes"
                            info="Maximum number of worker nodes this cluster may be scaled up to."
                            required={values.enableCAS}
                          />
                          }
                        </>
                      }
                    </>
                  )}
                </ValidatedForm>
              </WizardStep>

              <WizardStep stepId="network" label="Network Info">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  {({ setFieldValue, values }) => (
                    <>
                      {/* Use PF9 domain */}
                      <CheckboxField
                        id="usePf9Domain"
                        label="Use the platform9.net domain"
                        info="Select this option if you want Platform9 to automatically generate the endpoints or if you do not have access to Route 53."
                      />

                      {values.usePf9Domain || renderCustomNetworkingFields({
                        params,
                        getParamsUpdater,
                        values,
                        setFieldValue,
                        setWizardContext,
                        wizardContext,
                      })}

                      {/* API FQDN */}
                      {values.usePf9Domain ||
                      <TextField
                        id="externalDnsName"
                        label="API FQDN"
                        info="FQDN (Fully Qualified Domain Name) is used to reference cluster API. To ensure the API can be accessed securely at the FQDN, the FQDN will be included in the API server certificate's Subject Alt Names. If deploying onto a cloud provider, we will automatically create the DNS records for this FQDN using the cloud provider’s DNS service."
                        required
                      />
                      }
                      {/* Services FQDN */}
                      {values.usePf9Domain ||
                      <TextField
                        id="serviceFqdn"
                        label="Services FQDN"
                        info="FQDN used to reference cluster services. If deploying onto AWS, we will automatically create the DNS records for this FQDN into AWS Route 53."
                        required
                      />
                      }

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
                        info={<div>(Optional) Specify the HTTP proxy for this cluster. Uses format of <Code><span>{'<scheme>://<username>:<password>@<host>:<port>'}</span></Code> where <Code><span>{'<username>:<password>@'}</span></Code> is optional.</div>}
                      />

                      {/* Network plugin */}
                      <PicklistField
                        id="networkPlugin"
                        label="Network backend"
                        options={networkPluginOptions}
                        info=""
                        onChange={handleNetworkPluginChange({ setWizardContext, setFieldValue })}
                        required
                      />

                      {/* HTTP proxy */}
                      {values.networkPlugin === 'calico' &&
                      <TextField
                        id="mtuSize"
                        label="MTU Size"
                        info="Maximum Transmission Unit (MTU) for the interface (in bytes)"
                        required
                      />
                      }
                    </>
                  )}
                </ValidatedForm>
              </WizardStep>

              <WizardStep stepId="advanced" label="Advanced Configuration">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  {({ setFieldValue, values }) => (
                    <>
                      {/* Privileged */}
                      <CheckboxField
                        id="privileged"
                        label="Privileged"
                        disabled={['calico', 'canal', 'weave'].includes(values.networkPlugin)}
                        info={<div>Allows this cluster to run privileged containers. Read <ExternalLink url="https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities">this article</ExternalLink> for more information.</div>}
                      />

                      {/* Advanced API Configuration */}
                      <PicklistField
                        id="runtimeConfigOption"
                        label="Advanced API Configuration"
                        options={runtimeConfigOptions}
                        info="Make sure you are familiar with the Kubernetes API configuration documentation before enabling this option."
                        required
                      />

                      {values.runtimeConfigOption === 'custom' &&
                      <TextField
                        id="customRuntimeConfig"
                        label="Custom API Configuration"
                        info=""
                      />
                      }

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
              </WizardStep>

              <WizardStep stepId="review" label="Review">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  <AwsClusterReviewTable data={wizardContext} />
                </ValidatedForm>
              </WizardStep>
            </>
          )
        }}
      </Wizard>
    </FormWrapper>
  )
}

export default AddAwsClusterPage
