import React from 'react'
import { action } from '@storybook/addon-actions'
import { addStoriesFromModule } from '../../helpers'
import AddCloudProviderPage from 'k8s/components/infrastructure/cloudProviders/AddCloudProviderPage'

const addStories = addStoriesFromModule(module)
const onComplete = action('complete')

addStories('Kubernetes/Infrastructure/Cloud Providers', {
  'Adding a cloud provider': () => (
    <AddCloudProviderPage onComplete={onComplete} />
  ),
})
