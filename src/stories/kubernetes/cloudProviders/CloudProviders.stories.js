import React from 'react'
import { action } from '@storybook/addon-actions'
import { addStories } from '../../helpers'
import { AddCloudProviderForm } from 'k8s/components/infrastructure/AddCloudProviderPage'

const onComplete = action('complete')

addStories('Kubernetes/Infrastructure/Cloud Providers', {
  'Adding a cloud provider': () => (
    <AddCloudProviderForm onComplete={onComplete} />
  ),
})
