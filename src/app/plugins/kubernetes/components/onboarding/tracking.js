import Bugsnag from '@bugsnag/js'
import { trackEvent } from 'utils/tracking'

const formattedType = {
  bareOs: 'Build on My Infrastructure',
  cloud: 'Build on Public Cloud',
  import: 'Import Cluster',
}

const generateTrackEventHandler = ({
  defaultParams = {},
  currentStep,
  totalSteps,
  name,
  additionalParams,
}) => {
  const event = `WZ Onboarding  ${name} `
  const metadata = {
    ...defaultParams,
    ...additionalParams,
  }
  console.log(event)
  Bugsnag.leaveBreadcrumb(event, metadata)
  trackEvent(event, metadata)
}

export const onboardClusterTracking = {
  wZWelcome: (type) => {
    generateTrackEventHandler({
      defaultParams: {
        wizard_step: 'Initial Setup',
        wizard_state: 'In-Progress',
      },
      currentStep: '1',
      totalSteps: '4',
      name: formattedType[type],
    })
  },
  wZOvaDownload: () => {
    generateTrackEventHandler({
      defaultParams: {
        wizard_step: 'Ova Download',
        wizard_state: 'Ova-Downloading',
      },
      currentStep: '3',
      totalSteps: '4',
      name: 'Download OVA',
    })
  },
  wZCreateClusterOnInfrastructure: (option) => {
    generateTrackEventHandler({
      currentStep: '3',
      totalSteps: '4',
      name: `Create Cluster ${option}`,
    })
  },
  wZSelectedCloudProvider: (providerName, providerType) => {
    generateTrackEventHandler({
      currentStep: '2',
      totalSteps: '4',
      name: `Selected Cloud Provider`,
      additionalParams: {
        cloud_provider_name: providerName,
        cloud_provider_type: providerType,
      },
    })
  },
  wZSelectingCloudProviderType: (type) => {
    generateTrackEventHandler({
      currentStep: '2',
      totalSteps: '4',
      name: `connect ${type}`,
    })
  },
  wZCreateCloudProviderType: (providerName, providerType) => {
    generateTrackEventHandler({
      currentStep: '2',
      totalSteps: '4',
      name: `Created Cloud Provider Cloud Provider`,
      additionalParams: {
        cloud_provider_name: providerName,
        cloud_provider_type: providerType,
      },
    })
  },
  wzCreateClusterOnCloud: (providerName, providerType) => {
    generateTrackEventHandler({
      currentStep: '3',
      totalSteps: '4',
      name: `Create Cloud Cluster`,
      additionalParams: {
        cloud_provider_name: providerName,
        cloud_provider_type: providerType,
      },
    })
  },
  wzCreateClusterImported: (roviderName, providerType) => {
    generateTrackEventHandler({
      currentStep: '3',
      totalSteps: '4',
      name: `import Cloud Cluster`,
    })
  },
  wzSkipUser: () => {
    generateTrackEventHandler({
      currentStep: '4',
      totalSteps: '4',
      name: `Skipped User Invitation`,
      additionalParams: {
        cloud_provider_name: providerName,
        cloud_provider_type: providerType,
      },
    })
  },
  wzAddCoworker: () => {
    generateTrackEventHandler({
      currentStep: '4',
      totalSteps: '4',
      name: `Invited a User`,
    })
  },
}
