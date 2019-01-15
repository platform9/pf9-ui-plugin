import React from 'react'
import Checkbox from 'core/components/validatedForm/Checkbox'
import FormWrapper from 'core/components/FormWrapper'
import PicklistField from 'core/components/validatedForm/PicklistField'
import TextField from 'core/components/validatedForm/TextField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import Wizard from 'core/components/Wizard'
import WizardStep from 'core/components/WizardStep'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { compose, prop, propEq } from 'ramda'
import { loadCloudProviders } from './actions'
import { projectAs } from 'utils/fp'
import { withAppContext } from 'core/AppContext'
import { withDataLoader } from 'core/DataLoader'

const initialContext = {
  manualDeploy: false,
  disableWorkloadsOnMaster: true,
  numMasters: 1,
  useHttpProxy: false,
}

class AddClusterPage extends React.Component {
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
  }

  // This method will be deleted at the end of this PR.  It auto-selects the cloudProvider and region
  // so I don't need to waste time filling it out every time.
  async componentDidMount () {
    const cp = this.props.data.cloudProviders.find(x => x.name === 'mockOpenstackProvider')
    await this.handleCpChange(cp.uuid)
    const region = this.state.regions[0]
    await this.handleRegionChange(region)
    initialContext.cloudProvider = cp.uuid
    initialContext.region = region
    initialContext.name = 'New Cluster 123'
    initialContext.numWorkers = 3
    this.setState({ done: true })
  }

  handleSubmit = () => console.log('TODO: AddClusterPage#handleSubmit')

  handleCpChange = async cpId => {
    const cpDetails = await this.props.context.apiClient.qbert.getCloudProviderDetails(cpId)
    const cp = this.props.data.cloudProviders.find(x => x.uuid === cpId)
    const regions = cpDetails.Regions.map(prop('RegionName'))
    this.setState({ cpId, regions, cpType: cp.type })
  }

  handleRegionChange = async regionId => {
    const regionDetails = await this.props.context.apiClient.qbert.getCloudProviderRegionDetails(this.state.cpId, regionId)
    this.setState(regionDetails) // sets azs, domains, images, flavors, keyPairs, networks, operatingSystems, and vpcs
    console.log(regionDetails)
  }

  handleNetworkChange = networkId => {
    const net = this.state.networks.find(propEq('id', networkId))
    this.setState({ subnets: net.subnets })
  }

  render () {
    const { data } = this.props
    console.log(data.cloudProviders)
    console.log(this.state.cpType)
    const cloudProviderOptions = projectAs({ value: 'uuid', label: 'name' }, data.cloudProviders)
    const regionOptions = this.state.regions
    const imageOptions = projectAs({ value: 'id', label: 'name' }, this.state.images)
    const flavorOptions = projectAs({ value: 'id', label: 'name' }, this.state.flavors)
    const networkOptions = this.state.networks.map(x => ({ value: x.id, label: x.name || x.label }))
    const subnetOptions = this.state.subnets.map(x => ({ value: x.id, label: `${x.name} ${x.cidr}` }))

    // AWS and OpenStack cloud providers call this field differently
    const sshKeys = this.state.keyPairs.map(x => x.name || x.KeyName)
    if (!this.state.done) { return 'debug loading...' } // TODO: remove me before PR is done
    return (
      <FormWrapper title="Add Cluster">
        <Wizard onComplete={this.handleSubmit} context={initialContext}>
          {({ wizardContext, setWizardContext, onNext }) => {
            return (
              <React.Fragment>
                {false && <pre>{JSON.stringify(this.state, null, 4)}</pre>}
                {true && <pre>{JSON.stringify(wizardContext, null, 4)}</pre>}
                <WizardStep stepId="type" label="Cluster Type">
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <TextField id="name" label="name" />
                    <PicklistField id="cloudProvider" label="Cloud Provider" options={cloudProviderOptions} onChange={this.handleCpChange} />
                    <PicklistField id="region" label="Region" options={regionOptions} onChange={this.handleRegionChange} />
                    <Checkbox id="manualDeploy" label="Deploy cluster via install agent" />
                  </ValidatedForm>
                </WizardStep>
                <WizardStep stepId="config" label="Configuration">
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <PicklistField id="image" label="Image" options={imageOptions} />
                    <PicklistField id="masterFlavor" label="Master node instance flavor" options={flavorOptions} />
                    <PicklistField id="workerFlavor" label="Worker node instance flavor" options={flavorOptions} />
                    <TextField id="numMasters" label="Number of master nodes" type="number" />
                    <TextField id="numWorkers" label="Number of worker nodes" type="number" />
                    <Checkbox id="disableWorkloadsOnMaster" label="Disable workloads on master nodes" />
                  </ValidatedForm>
                </WizardStep>
                <WizardStep stepId="network" label="Networking">
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <PicklistField id="network" label="Network" options={networkOptions} onChange={this.handleNetworkChange} />
                    <PicklistField id="subnet" label="Subnets" options={subnetOptions} />
                    <p>Placeholder: Security groups</p>
                    <TextField id="apiFqdn" label="API FQDN" />
                    <TextField id="containersCidr" label="Containers CIDR" />
                    <TextField id="Services CIDR" label="Services CIDR" />
                    <Checkbox id="useHttpProxy" label="Use HTTP proxy" />
                  </ValidatedForm>
                </WizardStep>
                <WizardStep stepId="advancedConfig" label="Advanced Configuration">
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <PicklistField id="sshKey" label="SSH key" options={sshKeys} />
                    <Checkbox id="privileged" label="Privileged" />
                    <Checkbox id="advancedApi" label="Advanced API configuration" />
                    <Checkbox id="enableAppCatalog" label="Enable application catalog" />
                    <p>Placeholder: Tags</p>
                  </ValidatedForm>
                </WizardStep>
                <WizardStep stepId="review" label="Review">
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <p>Placeholder: Review</p>
                    <pre>{JSON.stringify(wizardContext, null, 4)}</pre>
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

const dataKeys = [
  'cloudProviders',
  'flavors',
  'regions',
]

const loaders = [
  loadCloudProviders,
  createCRUDActions({ service: 'nova', entity: 'flavors' }).list,
  createCRUDActions({ service: 'keystone', entity: 'regions' }).list,
]

export default compose(
  withDataLoader({ dataKey: dataKeys, loaderFn: loaders }),
  withAppContext,
)(AddClusterPage)
