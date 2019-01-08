import React from 'react'
import Checkbox from 'core/common/validated_form/Checkbox'
import FormWrapper from 'core/common/FormWrapper'
import PicklistField from 'core/common/validated_form/PicklistField'
import TextField from 'core/common/validated_form/TextField'
import ValidatedForm from 'core/common/validated_form/ValidatedForm'
import Wizard from 'core/common/Wizard'
import WizardStep from 'core/common/WizardStep'
import { compose } from 'ramda'
import { loadCloudProviders } from './actions'
import { withDataLoader } from 'core/DataLoader'

const initialContext = {
  manualDeploy: false,
}

class AddClusterPage extends React.Component {
  handleSubmit = () => console.log('TODO: AddClusterPage#handleSubmit')

  render () {
    const { data=[] } = this.props
    const cloudProviderOptions = data.map(cp => ({ value: cp.uuid, label: cp.name }))
    const regions = []
    const images = []
    const flavors = []
    const networks = []
    const subnets = []
    const sshKeys = []
    return (
      <FormWrapper title="Add Cluster">
        <Wizard onComplete={this.handleSubmit} context={initialContext}>
          {({ wizardContext, setWizardContext, onNext }) => {
            return (
              <React.Fragment>
                <pre>{JSON.stringify(wizardContext, null, 4)}</pre>
                <WizardStep stepId="type" label="Cluster Type">
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <PicklistField id="cloudProvider" label="Cloud Provider" options={cloudProviderOptions} />
                    <Checkbox id="manualDeploy" label="Deploy cluster via install agent" />
                    <TextField id="name" label="name" />
                    <PicklistField id="region" label="Region" options={regions} />
                  </ValidatedForm>
                </WizardStep>
                <WizardStep stepId="config" label="Configuration">
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <PicklistField id="image" label="Image" options={images} />
                    <PicklistField id="masterFlavor" label="Master node instance flavor" options={flavors} />
                    <PicklistField id="workerFlavor" label="Worker node instance flavor" options={flavors} />
                    <TextField id="numMasters" label="Number of master nodes" type="number" />
                    <TextField id="numWorkers" label="Number of worker nodes" type="number" />
                    <Checkbox id="disableWorkloadsOnMaster" label="Disable workloads on master nodes" />
                  </ValidatedForm>
                </WizardStep>
                <WizardStep stepId="network" label="Networking">
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <PicklistField id="network" label="Network" options={networks} />
                    <PicklistField id="subnet" label="Subnets" options={subnets} />
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

export default compose(
  withDataLoader({ dataKey: 'cloudProviders', loaderFn: loadCloudProviders }),
)(AddClusterPage)
