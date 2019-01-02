import React from 'react'
import { withDataLoader } from 'core/DataLoader'
import FormWrapper from 'core/common/FormWrapper'
import PicklistField from 'core/common/validated_form/PicklistField'
import ValidatedForm from 'core/common/validated_form/ValidatedForm'
import Wizard from 'core/common/Wizard'
import WizardStep from 'core/common/WizardStep'
import { compose } from 'ramda'
import { loadCloudProviders } from './actions'
import { withAppContext } from 'core/AppContext'

class AddClusterPage extends React.Component {
  render () {
    // const { data } = this.props
    // const cloudProviderOptions = data.map(cp => ({ value: cp.uuid, label: cp.name }))
    const cloudProviderOptions = [
      { value: '1', label: 'first cloud provider' },
      { value: '2', label: 'another cloud provider' },
    ]
    return (
      <FormWrapper title="Add Cluster">
        <Wizard onComplete={this.handleSubmit}>
          {({ wizardContext, setWizardContext, onNext }) => {
            return (
              <React.Fragment>
                <WizardStep stepId="type" label="Cluster Type">
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <PicklistField id="cloudProvider" label="Cloud Provider" options={cloudProviderOptions} />
                    <h1>Cluster Type</h1>
                  </ValidatedForm>
                </WizardStep>
                <WizardStep stepId="config" label="Configuration">
                  <h1>Cluster Config</h1>
                </WizardStep>
                <WizardStep stepId="network" label="Networking">
                  <h1>Networking</h1>
                </WizardStep>
                <WizardStep stepId="advancedConfig" label="Advanced Configuration">
                  <h1>Advanced Configuration</h1>
                </WizardStep>
                <WizardStep stepId="review" label="Review">
                  <h1>Review</h1>
                </WizardStep>
              </React.Fragment>
            )
          }}
        </Wizard>
      </FormWrapper>
    )
  }
}

compose(
  withAppContext,
  withDataLoader({ dataKey: 'cloudProviders', loaderFn: loadCloudProviders }),
)(AddClusterPage)

export default AddClusterPage
