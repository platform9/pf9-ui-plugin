import React from 'react'
import createAddComponents from 'core/helpers/createAddComponents'
import Wizard from 'core/components/wizard/Wizard'
import WizardStep from 'core/components/wizard/WizardStep'
import { storageClassesCacheKey } from './actions'

export const AddStorageClassForm = () => {
  return (
    <Wizard>
      {() =>
        <>
          <BasicStep />
          <CustomizeStep />
        </>
      }
    </Wizard>
  )
}

// TODO: implement Steps
const BasicStep = () => <WizardStep stepId="basic" label="Basic">Basic Step</WizardStep>
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
