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
  ami: 'ubuntu',
  masterFlavor: 't2.small',
  workerFlavor: 't2.small',
  numMasters: 1,
  numWorkers: 1,
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
      runWorkloadsOnMaster: true,
      masterFlavor: 't2.small',
      workerFlavor: 't2.small',
    },
    medium: {
      numMasters: 1,
      numWorkers: 3,
      runWorkloadsOnMaster: false,
      masterFlavor: 't2.medium',
      workerFlavor: 't2.medium',
    },
    large: {
      numMasters: 3,
      numWorkers: 5,
      runWorkloadsOnMaster: false,
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

const AddAwsClusterPage = () => {
  const { params, getParamsUpdater } = useParams()

  const handleSubmit = () => {
    // TODO
  }

  return (
    <Wizard onComplete={handleSubmit} context={initialContext}>
      {({ wizardContext, setWizardContext, onNext }) => {
        return (
          <>
            <WizardStep stepId="basic" label="Basic Info">
              <FormWrapper title="Add Cluster">
                <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext}>
                  {({ setFieldValue }) => (
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
                      />

                      {/* Operating System */}
                      <PicklistField
                        id="ami"
                        label="Operating System"
                        options={operatingSystemOptions}
                        info="Operating System / AMI"
                      />

                      {/* CLUSTER CONFIGURATION STEP */}
                      {/* TODO: Leaving in first step for easier development.  Move this into its own step once we are done */}

                      {/* Master node instance type */}
                      <PicklistField
                        DropdownComponent={AwsRegionFlavorPicklist}
                        disabled={!(params.cloudProviderId && params.cloudProviderRegionId)}
                        id="masterFlavor"
                        label="Master Node Instance Type"
                        cloudProviderId={params.cloudProviderId}
                        cloudProviderRegionId={params.cloudProviderRegionId}
                        info="Choose an instance type used by master nodes."
                      />

                      {/* Num master nodes */}
                      <TextField
                        id="numMasters"
                        type="number"
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
                      />

                      {/* Num worker nodes */}
                      <TextField
                        id="numWorkers"
                        type="number"
                        label="Number of worker nodes"
                        info="Number of worker nodes to deploy."
                        required
                      />
                    </>
                  )}

                </ValidatedForm>
              </FormWrapper>
            </WizardStep>

            <WizardStep stepId="config" label="Cluster Configuration">
              <FormWrapper title="Cluster Configuration">
                <ValidatedForm>
                  {/* Master node instance type */}
                  {/* Num master nodes */}

                  {/* Worker node instance type */}
                  {/* Num worker nodes */}
                  {/* Checkbox 'Enable Auto Scaling' */}
                  {/* Max worker nodes */}

                  {/* Disable workloads on master nodes */}
                  {/* Enable spot workers */}
                  {/* Percent of worker nodes as spot instances */}
                  {/* Spot price */}
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
/*
import ApiClient from 'api-client/ApiClient'
import { withAppContext } from 'core/AppProvider'
import withDataLoader from 'core/hocs/withDataLoader'
import withDataMapper from 'core/hocs/withDataMapper'
import {
  cloudProviderActions, flavorActions, regionActions,
} from 'k8s/components/infrastructure/actions'

const initialContext = {
  manualDeploy: false,
  disableWorkloadsOnMaster: true,
  masterNodes: 1,
  useHttpProxy: false,
  clusterTags: [],
  securityGroups: [],
}

// TODO Refactor this to be a function component and use hooks
class AddClusterPage extends PureComponent {
  state = {
    azs: [],
    domains: [],
    flavors: [],
    images: [],
    keyPairs: [],
    operatingSystems: [],
    regions: [],
    vpcs: [],
    networks: [],
    subnets: [],
    manualDeploy: false,
    masterNodes: [],
    workerNodes: [],
    enableMetalLb: false,
  }

  handleSubmit = () => console.log('TODO: AddClusterPage#handleSubmit')

  handleCpChange = async cpId => {
    const cpDetails = await ApiClient.getInstance().qbert.getCloudProviderDetails(cpId)
    const cp = this.props.data.cloudProviders.find(x => x.uuid === cpId)
    const regions = cpDetails.Regions.map(prop('RegionName'))
    this.setState({ cpId, regions, cpType: cp.type })
  }

  handleRegionChange = async regionId => {
    const regionDetails = await ApiClient.getInstance().qbert.getCloudProviderRegionDetails(this.state.cpId, regionId)
    this.setState(regionDetails) // sets azs, domains, images, flavors, keyPairs, networks, operatingSystems, and vpcs
  }

  handleNetworkChange = networkId => {
    const net = this.state.networks.find(propEq('id', networkId))
    this.setState({ subnets: net.subnets })
  }

  setField = key => value => this.setState({ [key]: value })

  setMasterNodes = masterNodes => this.setState({ masterNodes })
  setWorkerNodes = workerNodes => this.setState({ workerNodes })

  renderReviewTable = wizard => {
    const { cloudProviders } = this.props.data

    // React will always call this render method even before the user has populated any fields.
    // If we ensure all the data exist before proceeding we can remove lots of ugly conditionals
    // later on.
    if (!cloudProviders || !wizard.cloudProvider) { return null }

    const cp = cloudProviders.find(propEq('uuid', wizard.cloudProvider))
    const { cpType } = this.state

    // TODO: need to find a way to clean up the conditionals from the old code base
    //
    // conditionals:
    //
    // not manualDeploy
    // openstack
    // regionType
    // useHttpProxy
    // useAdvancedApiConfig
    // is manualDeploy || aws
    // create new VPC
    // enableSpotWorkers
    // enableMetalLB
    // configureNetworkBackend
    let review = {
      'Cluster Deployment Type': wizard.manualDeploy ? 'manual' : 'auto',
    }
    if (!wizard.manualDeploy) {
      review['Cloud Provider'] = cp.name
      if (cpType === 'openstack') {
      }
      if (cpType === 'aws') {
      }
    }

    return <pre>{JSON.stringify(review, null, 4)}</pre>
  }

  renderManualDeployNetworking = () => (
    <React.Fragment>
      <TextField
        id="virtualIP"
        label="Virtual IP"
        info="Virtual IP address for cluster"
      />
      <PicklistField
        id="virtualIpInterface"
        label="Virtual IP address for cluster"
        options={[]}
        info={
          <span>
            Specify the virtual IP address that will be used to provide access to the API server endpoint for this cluster. Refer to
            <ExternalLink url="https://docs.platform9.com/support/ha-for-baremetal-multimaster-kubernetes-cluster-service-type-load-balancer/">this article</ExternalLink>
            for more information re how the VIP service operates, VIP configuration, etc.
          </span>
        }
      />
      <Checkbox
        id="enableMetalLb"
        label="Enable MetalLB"
        info="Select if MetalLB should load-balancer should be enabled for this cluster. Platform9 uses MetalLB - a load-balancer implementation for bare metal Kubernetes clusters that uses standard routing protocols - for service level load balancing. Enabling MetalLB on this cluster will provide the ability to create services of type load-balancer."
        onChange={value => this.setState({ enableMetalLb: value })}
      />
      {this.state.enableMetalLb && this.renderMetalLbFields()}
    </React.Fragment>
  )

  renderMetalLbFields = () => (
    <React.Fragment>
      <TextField id="metalAddressPoolStart" label="Metal Address Pool Start" />
      <TextField id="metalAddressPoolEnd" label="Metal Address Pool End" />
    </React.Fragment>
  )

  render () {
    const { data } = this.props
    const { images, flavors, keyPairs, manualDeploy, networks, regions, subnets } = this.state
    const regionOptions = regions
    const imageOptions = projectAs({ value: 'id', label: 'name' }, images)
    const flavorOptions = projectAs({ value: 'id', label: 'name' }, flavors)
    const networkOptions = networks.map(x => ({ value: x.id, label: x.name || x.label }))
    const subnetOptions = subnets.map(x => ({ value: x.id, label: `${x.name} ${x.cidr}` }))

    // AWS and OpenStack cloud providers call this field differently
    const sshKeys = keyPairs.map(x => x.name || x.KeyName)
    return (
      <FormWrapper title="Add Cluster">
        <Wizard onComplete={this.handleSubmit} context={initialContext}>
          {({ wizardContext, setWizardContext, onNext }) => {
            return (
              <React.Fragment>
                <WizardStep stepId="type" label="Cluster Type">
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <Checkbox
                      id="manualDeploy"
                      label="Deploy cluster via install agent"
                      onChange={this.setField('manualDeploy')}
                      info="Use this option to download and deploy Platform9 host agent on individual nodes to create a cluster using them."
                    />
                    <TextField
                      id="name"
                      label="name"
                      info="Name of the cluster"
                    />
                    {!manualDeploy && <React.Fragment>
                      <PicklistField
                        id="cloudProvider"
                        label="Cloud Provider"
                        options={cloudProviderOptions}
                        onChange={this.handleCpChange}
                        info="Nodes will be provisioned using this cloud provider."
                      />
                      <PicklistField
                        id="region"
                        label="Region"
                        options={regionOptions}
                        onChange={this.handleRegionChange}
                      />
                    </React.Fragment>}
                    {manualDeploy && <NodesChooser
                      name="masterNodes"
                      label="Master Nodes (choose 1, 3, or 5 nodes)"
                      onChange={this.setMasterNodes}
                    />}
                  </ValidatedForm>
                </WizardStep>
                <WizardStep stepId="config" label="Configuration">
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <Checkbox id="disableWorkloadsOnMaster" label="Disable workloads on master nodes" />
                    {!manualDeploy && <React.Fragment>
                      <PicklistField id="image" label="Image" options={imageOptions} />
                      <PicklistField id="masterFlavor" label="Master node instance flavor" options={flavorOptions} />
                      <PicklistField id="workerFlavor" label="Worker node instance flavor" options={flavorOptions} />
                      <TextField id="masterNodes" label="Number of master nodes" type="number" />
                      <TextField id="numWorkers" label="Number of worker nodes" type="number" />
                    </React.Fragment>}
                    {manualDeploy && <NodesChooser
                      name="workerNodes"
                      label="Worker Nodes"
                      onChange={this.setWorkerNodes}
                    />}
                  </ValidatedForm>
                </WizardStep>
                <WizardStep stepId="network" label="Networking">
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    {manualDeploy && this.renderManualDeployNetworking(wizardContext)}
                    <PicklistField id="network" label="Network" options={networkOptions} onChange={this.handleNetworkChange} />
                    <PicklistField id="subnet" label="Subnets" options={subnetOptions} />
                    <p>Placeholder: Security groups</p>
                    <TextField id="apiFqdn" label="API FQDN" />
                    <TextField id="containersCidr" label="Containers CIDR" />
                    <TextField id="servicesCidr" label="Services CIDR" />
                    <Checkbox id="useHttpProxy" label="Use HTTP proxy" />
                  </ValidatedForm>
                </WizardStep>
                <WizardStep stepId="advancedConfig" label="Advanced Configuration">
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <PicklistField id="keyPair" label="SSH key" options={sshKeys} />
                    <Checkbox id="privileged" label="Privileged" />
                    <Checkbox id="useAdvancedApiConfig" label="Advanced API configuration" />
                    <Checkbox id="appCatalogEnabled" label="Enable application catalog" />
                    <KeyValuesField id="clusterTags" label="Tags" />
                  </ValidatedForm>
                </WizardStep>
                <WizardStep stepId="review" label="Review">
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    {this.renderReviewTable(wizardContext)}
                  </ValidatedForm>
                </WizardStep>
              </React.Fragment>
            )
          }}
        </Wizard>
      </FormWrapper>
    )
  }
}

export default compose(
  withAppContext,
  withDataLoader({
    cloudProviders: cloudProviderActions.list,
    flavors: flavorActions.list,
    regions: regionActions.list,
  }),
  withDataMapper({
    cloudProviders: propOr([], 'cloudProviders'),
    flavors: propOr([], 'flavors'),
    regions: propOr([], 'regions'),
  }),
)(AddClusterPage)
*/
