import React from 'react'
import FormWrapper from 'core/common/FormWrapper'
import PicklistField from 'core/common/validated_form/PicklistField'
import ValidatedForm from 'core/common/validated_form/ValidatedForm'
import Wizard from 'core/common/Wizard'
import WizardStep from 'core/common/WizardStep'
import { compose } from 'ramda'
import { loadCloudProviders } from './actions'
import { withDataLoader } from 'core/DataLoader'

class AddClusterPage extends React.Component {
  handleSubmit = () => console.log('TODO: AddClusterPage#handleSubmit')

  render () {
    const { data=[] } = this.props
    const cloudProviderOptions = data.map(cp => ({ value: cp.uuid, label: cp.name }))
    return (
      <FormWrapper title="Add Cluster">
        <Wizard onComplete={this.handleSubmit}>
          {({ wizardContext, setWizardContext, onNext }) => {
            return (
              <React.Fragment>
                <WizardStep stepId="type" label="Cluster Type">
                  <ValidatedForm initialValues={wizardContext} onSubmit={setWizardContext} triggerSubmit={onNext}>
                    <PicklistField id="cloudProvider" label="Cloud Provider" options={cloudProviderOptions} />
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

export default compose(
  withDataLoader({ dataKey: 'cloudProviders', loaderFn: loadCloudProviders }),
)(AddClusterPage)
