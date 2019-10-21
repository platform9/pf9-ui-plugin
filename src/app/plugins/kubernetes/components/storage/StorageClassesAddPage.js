import React from 'react'
import createAddComponents from 'core/helpers/createAddComponents'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import FormWrapper from 'core/components/FormWrapper'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import TextField from 'core/components/validatedForm/TextField'
import PicklistField from 'core/components/validatedForm/PicklistField'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import { storageClassesCacheKey } from './actions'
import useParams from 'core/hooks/useParams'

const initialContext = {}

export const AddStorageClassForm = () => {
  return (
    <Wizard context={initialContext}>
      {({ setWizardContext, onNext }) =>
        <>
          <BasicStep onSubmit={setWizardContext} triggerSubmit={onNext} />
          <CustomizeStep />
        </>
      }
    </Wizard>
  )
}

const BasicStep = ({ onSubmit, triggerSubmit }) => {
  const { params, getParamsUpdater } = useParams()

  return (
    <WizardStep stepId="basic" label="Basic">
      <p>
        Create a new storage class on a specific cluster by specifying the storage type that maps to the cloud provider for that cluster.
      </p>
      <FormWrapper title="Add Storage Class">
        <ValidatedForm onSubmit={onSubmit} triggerSubmit={triggerSubmit}>
          <TextField
            id="name"
            label="Name"
            info="Name for this storage class."
            required
          />
          <PicklistField
            DropdownComponent={ClusterPicklist}
            id="clusterId"
            label="Cluster"
            onChange={getParamsUpdater('clusterId')}
            info="The cluster to deploy this storage class on."
            value={params.clusterId}
            required
          />
          <CheckboxField
            id="isDefault"
            label="Use as Default Storage Class"
            onChange={getParamsUpdater('isDefault')}
            info=""
          />
        </ValidatedForm>
      </FormWrapper>
    </WizardStep>
  )
}

// TODO: implement CustomizeStep
const CustomizeStep = () => <WizardStep stepId="customize" label="Customize">Customize Step</WizardStep>

export const options = {
  cacheKey: storageClassesCacheKey,
  FormComponent: AddStorageClassForm,
  listUrl: '/ui/kubernetes/storage_classes',
  name: 'AddStorageClass',
  title: 'New Storage Class',
}

const { AddPage } = createAddComponents(options)

export default AddPage
