import React from 'react'
import createAddComponents from 'core/helpers/createAddComponents'
import { storageClassesCacheKey } from './actions'

// TODO: Add Form
export const AddStorageClassForm = () => <h1>Add Form</h1>

export const options = {
  cacheKey: storageClassesCacheKey,
  FormComponent: AddStorageClassForm,
  listUrl: '/ui/kubernetes/storage_classes',
  name: 'AddStorageClass',
  title: 'New Storage Class',
}

const { AddPage } = createAddComponents(options)

export default AddPage
