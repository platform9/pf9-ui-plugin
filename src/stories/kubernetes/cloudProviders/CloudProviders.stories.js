import React from 'react'
import { AddCloudProviderForm } from 'kubernetes/components/infrastructure/AddCloudProviderPage'
import { action } from '@storybook/addon-actions'
import { addStories } from '../../helpers'

const onComplete = action('complete')

addStories('Kubernetes/Infrastructure/Cloud Providers', {
  'Adding a cloud provider': () => (
    <AddCloudProviderForm onComplete={onComplete} />
  ),
})
