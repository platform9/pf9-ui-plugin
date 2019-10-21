import React from 'react'
import FormWrapper from 'core/components/FormWrapper'
import AzureAvailabilityZoneChooser from '../common/AzureAvailabilityZoneChooser'
import AzureClusterReviewTable from '../common/AzureClusterReviewTable'
import AzureSkuPicklist from '../common/AzureSkuPicklist'
import AzureSubnetPicklist from '../common/AzureSubnetPicklist'
import AzureVnetPicklist from '../common/AzureVnetPicklist'
import AzureResourceGroupPicklist from '../common/AzureResourceGroupPicklist'
import CloudProviderPicklist from 'k8s/components/common/CloudProviderPicklist'
import CloudProviderRegionPicklist from 'k8s/components/common/CloudProviderRegionPicklist'
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
import { pick } from 'ramda'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'

const initialContext = {
  template: 'small',
  masterSku: 'Standard_A1_v2',
  workerSku: 'Standard_A1_v2',
  numMasters: 1,
  numWorkers: 1,
  usePf9Domain: true,
  network: 'newNetwork',
  containersCidr: '10.20.0.0/16',
  servicesCidr: '10.21.0.0/16',
  networkPlugin: 'flannel',
  runtimeConfigOption: 'default',
  useAllAvailabilityZones: true,
  assignPublicIps: false,
}

const templateOptions = [
  { label: 'small (single dev) - 1 node master + worker (Standard_A1_v2)', value: 'small' },
  { label: 'medium (internal team) - 1 master + 3 workers (Standard_A2_v2)', value: 'medium' },
  { label: 'large (production) - 3 masters + 5 workers (Standard_A4_v2)', value: 'large' },
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
const handleTemplateChoice = ({ setWizardContext, setFieldValue }) => option => {
  const options = {
    small: {
      numMasters: 1,
      numWorkers: 0,
      allowWorkloadsOnMaster: true,
      masterFlavor: 'Standard_A1_v2',
      workerFlavor: 'Standard_A1_v2',
    },
    medium: {
      numMasters: 1,
      numWorkers: 3,
      allowWorkloadsOnMaster: false,
      masterFlavor: 'Standard_A2_v2',
      workerFlavor: 'Standard_A2_v2',
    },
    large: {
      numMasters: 3,
      numWorkers: 5,
      allowWorkloadsOnMaster: false,
      masterFlavor: 'Standard_A4_v2',
      workerFlavor: 'Standard_A4_v2',
    }
  }

  if (!options[option]) return
  setWizardContext(options[option])
  Object.entries(options[option]).forEach(([key, value]) => {
    setFieldValue(key)(value)
  })
}

const networkOptions = [
  { label: 'Select existing', value: 'existing' },
  { label: 'Create new network', value: 'newNetwork' },
]

const AddAzureClusterPage = () => {
  const { params, getParamsUpdater } = useParams()
  const { history } = useReactRouter()
  const onComplete = () => {
    history.push('/ui/kubernetes/infrastructure#clusters')
  }
  const [create] = useDataUpdater(clusterActions.create, onComplete)

  const handleSubmit = params => async data => {
    const body = {
      // basic info
      ...pick('nodePoolUuid name location zones sshKey'.split(' '), data),

      // cluster configuration
      ...pick('masterSku workerSku numMasters numWorkers allowWorkloadsOnMaster'.split(' '), data),

      // network info
      ...pick('assignPublicIps vnetResourceGroup vnetName masterSubnetName workerSubnetName externalDnsName serviceFqdn containersCidr servicesCidr networkPlugin'.split(' '), data),

      // advanced configuration
      ...pick('privileged appCatalogEnabled customAmi tags'.split(' '), data),
    }
    if (data.useAllAvailabilityZones) { body.zones = [] }
    if (data.httpProxy) { body.httpProxy = data.httpProxy }
    if (data.networkPlugin === 'calico') { body.mtuSize = data.mtuSize }

    data.runtimeConfig = {
      default: '',
      all: 'api/all=true',
      custom: data.customRuntimeConfig,
    }[data.runtimeConfigOption]

    await create(body)
    return body
  }

  return (
    <Wizard onComplete={handleSubmit(params)} context={initialContext}>
      {({ wizardContext, setWizardContext, onNext }) => {
        return (
          <>
            <WizardStep stepId="basic" label="Basic Info">
              <FormWrapper title="Add Cluster">
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
                        id="nodePoolUuid"
                        label="Cloud Provider"
                        onChange={getParamsUpdater('cloudProviderId')}
                        info="Nodes will be provisioned using this cloud provider."
                        value={params.cloudProviderId}
                        type="azure"
                        required
                      />

                      {/* AWS Region */}
                      <PicklistField
                        DropdownComponent={CloudProviderRegionPicklist}
                        disabled={!params.cloudProviderId}
                        id="location"
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

                      {/* SSH Key */}
                      <TextField
                        id="sshKey"
                        label="Public SSH key"
                        info="Copy/paste your public SSH key"
                        multiline
                        rows={3}
                        required
                      />
                    </>
                  )}
                </ValidatedForm>
              </FormWrapper>
            </WizardStep>

            <WizardStep stepId="config" label="Cluster Configuration">
              <FormWrapper title="Cluster Configuration">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  {({ setFieldValue, values }) => (
                    <>
                      <CheckboxField
                        id="useAllAvailabilityZones"
                        label="Use all availability zones"
                        onChange={checked => checked || getParamsUpdater('zones')([])}
                        info=""
                      />

                      {/* Azure Availability Zone */}
                      {values.useAllAvailabilityZones ||
                        <AzureAvailabilityZoneChooser
                          id="zones"
                          info="Select from the Availability Zones for the specified region"
                          onChange={getParamsUpdater('zones')}
                          required
                        />
                      }

                      {/* Master node SKU */}
                      <PicklistField
                        DropdownComponent={AzureSkuPicklist}
                        disabled={!(params.cloudProviderId && params.cloudProviderRegionId)}
                        id="masterSku"
                        label="Master Node SKU"
                        cloudProviderId={params.cloudProviderId}
                        cloudProviderRegionId={params.cloudProviderRegionId}
                        filterByZones={!values.useAllAvailabilityZones}
                        selectedZones={params.zones}
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

                      {/* Worker node SKU */}
                      <PicklistField
                        DropdownComponent={AzureSkuPicklist}
                        disabled={!(params.cloudProviderId && params.cloudProviderRegionId)}
                        id="workerSku"
                        label="Worker Node SKU"
                        cloudProviderId={params.cloudProviderId}
                        cloudProviderRegionId={params.cloudProviderRegionId}
                        filterByZones={!values.useAllAvailabilityZones}
                        selectedZones={params.zones}
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

                      {/* Allow workloads on masters */}
                      <CheckboxField
                        id="allowWorkloadsOnMaster"
                        label="Allow workloads on master nodes"
                        info="It is highly recommended to not enable workloads on master nodes for production or critical workload clusters."
                      />
                    </>
                  )}
                </ValidatedForm>
              </FormWrapper>
            </WizardStep>

            <WizardStep stepId="network" label="Network Info">
              <FormWrapper title="Network Info">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  {({ setFieldValue, values }) => (
                    <>
                      {/* Assign public IP's */}
                      <CheckboxField
                        id="assignPublicIps"
                        label="Assign public IP's"
                        info="Assign a public IP for every node created on this cluster."
                      />

                      {/* Network */}
                      <PicklistField
                        id="network"
                        options={networkOptions}
                        label="Network"
                        info="Select existing networking resources or automatically create and assign new networking resources."
                        required
                      />

                      {values.network === 'existing' &&
                        <>
                          {/* Resource group */}
                          <PicklistField
                            DropdownComponent={AzureResourceGroupPicklist}
                            disabled={!(params.cloudProviderId && params.cloudProviderRegionId)}
                            id="vnetResourceGroup"
                            label="Resource group"
                            cloudProviderId={params.cloudProviderId}
                            cloudProviderRegionId={params.cloudProviderRegionId}
                            onChange={getParamsUpdater('resourceGroup')}
                            info="Select the resource group that your networking resources belong to."
                            required
                          />

                          {/* Existing network.  I don't get the point of this field. */}
                          <PicklistField
                            DropdownComponent={AzureVnetPicklist}
                            disabled={!(params.cloudProviderId && params.cloudProviderRegionId)}
                            id="vnetName"
                            label="Select existing network"
                            cloudProviderId={params.cloudProviderId}
                            cloudProviderRegionId={params.cloudProviderRegionId}
                            resourceGroup={params.resourceGroup}
                            info="Select the network for your cluster."
                            required
                          />

                          {/* Master node subnet */}
                          <PicklistField
                            DropdownComponent={AzureSubnetPicklist}
                            disabled={!(params.cloudProviderId && params.cloudProviderRegionId)}
                            id="masterSubnetName"
                            label="Master node subnet"
                            cloudProviderId={params.cloudProviderId}
                            cloudProviderRegionId={params.cloudProviderRegionId}
                            resourceGroup={params.resourceGroup}
                            info="Select the subnet for your master nodes. Can be the same as worker node subnet."
                            required
                          />

                          {/* Worker node subnet */}
                          <PicklistField
                            DropdownComponent={AzureSubnetPicklist}
                            disabled={!(params.cloudProviderId && params.cloudProviderRegionId)}
                            id="workerSubnetName"
                            label="Worker node subnet"
                            cloudProviderId={params.cloudProviderId}
                            cloudProviderRegionId={params.cloudProviderRegionId}
                            resourceGroup={params.resourceGroup}
                            info="Select the subnet for your worker nodes. Can be the same as master node subnet."
                            required
                          />
                        </>
                      }

                      {/* API FQDN */}
                      <TextField
                        id="externalDnsName"
                        label="API FQDN"
                        info="FQDN used to reference cluster API. To ensure the API can be accessed securely at the FQDN, the FQDN will be included in the API server certificate's Subject Alt Names. If deploying onto AWS, we will automatically create the DNS records for this FQDN into AWS Route 53."
                        required
                      />

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
                    </>
                  )}
                </ValidatedForm>
              </FormWrapper>
            </WizardStep>

            <WizardStep stepId="advanced" label="Advanced Configuration">
              <FormWrapper title="Advanced Configuration">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  {({ setFieldValue, values }) => (
                    <>
                      {/* Privileged */}
                      <CheckboxField
                        id="privileged"
                        label="Privileged"
                        disabled={['calico', 'canal', 'weave'].includes(values.networkPlugin)}
                        info="Allows this cluster to run privileged containers. Read this article for more information."
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

            <WizardStep stepId="review" label="Review">
              <FormWrapper title="Review">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                  <AzureClusterReviewTable data={wizardContext} />
                </ValidatedForm>
              </FormWrapper>
            </WizardStep>
          </>
        )
      }}
    </Wizard>
  )
}

export default AddAzureClusterPage
