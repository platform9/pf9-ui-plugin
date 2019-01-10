import React from 'react'
import Checkbox from 'core/common/validated_form/Checkbox'
import FormWrapper from 'core/common/FormWrapper'
import PicklistField from 'core/common/validated_form/PicklistField'
import TextField from 'core/common/validated_form/TextField'
import ValidatedForm from 'core/common/validated_form/ValidatedForm'
import Wizard from 'core/common/Wizard'
import WizardStep from 'core/common/WizardStep'
import createCRUDActions from 'core/helpers/createCRUDActions'
import { compose, prop, propEq } from 'ramda'
import { loadCloudProviders } from './actions'
import { projectAs } from 'core/fp'
import { withAppContext } from 'core/AppContext'
import { withDataLoader } from 'core/DataLoader'

const initialContext = {
  manualDeploy: false,
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
  }

  handleSubmit = () => console.log('TODO: AddClusterPage#handleSubmit')

  handleCpChange = async cpId => {
    const cpDetails = await this.props.context.apiClient.qbert.getCloudProviderDetails(cpId)
    const regions = cpDetails.Regions.map(prop('RegionName'))
    this.setState({ cpId, regions })
  }

  handleRegionChange = async regionId => {
    const regionDetails = await this.props.context.apiClient.qbert.getCloudProviderRegionDetails(this.state.cpId, regionId)
    this.setState(regionDetails) // sets azs, domains, images, flavors, keyPairs, networks, operatingSystems, and vpcs
  }

  handleNetworkChange = networkId => {
    const net = this.state.networks.find(propEq('id', networkId))
    this.setState({ subnets: net.subnets })
  }

  render () {
    const { data } = this.props
    const cloudProviderOptions = projectAs({ value: 'uuid', label: 'name' }, data.cloudProviders)
    const regionOptions = this.state.regions
    const imageOptions = projectAs({ value: 'id', label: 'name' }, this.state.images)
    const flavorOptions = projectAs({ value: 'id', label: 'name' }, this.state.flavors)
    const networkOptions = this.state.networks.map(x => ({ value: x.id, label: x.name || x.label }))
    const subnetOptions = this.state.subnets.map(x => ({ value: x.id, label: `${x.name} ${x.cidr}` }))
    const sshKeys = []
    return (
      <FormWrapper title="Add Cluster">
        <Wizard onComplete={this.handleSubmit} context={initialContext}>
          {({ wizardContext, setWizardContext, onNext }) => {
            return (
              <React.Fragment>
                {false && <pre>{JSON.stringify(this.state, null, 4)}</pre>}
                {false && <pre>{JSON.stringify(wizardContext, null, 4)}</pre>}
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
