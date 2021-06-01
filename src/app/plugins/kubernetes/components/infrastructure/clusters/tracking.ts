import Bugsnag from '@bugsnag/js'
import { trackEvent } from 'utils/tracking'
import { CloudProviders } from '../cloudProviders/model'
import { ClusterCreateTypes } from './model'

const formattedTargetNames = {
  [ClusterCreateTypes.OneClick]: 'One-Click',
  [ClusterCreateTypes.Custom]: '',
  [ClusterCreateTypes.SingleMaster]: 'SM',
  [ClusterCreateTypes.MultiMaster]: 'MM',
}
const formattedPlatformNames = {
  [CloudProviders.Aws]: 'AWS',
  [CloudProviders.Azure]: 'Azure',
  [CloudProviders.PhysicalMachine]: 'Physical',
  [CloudProviders.VirtualMachine]: 'VM',
}

const generateTrackEventHandler = ({
  defaultParams = {},
  currentStep,
  totalSteps,
  name,
  additionalParams = (ctx) => ({}),
}) => ({ platform, target }) => (context = {}) => {
  const event = `WZ New ${formattedPlatformNames?.[platform]} Cluster ${formattedTargetNames?.[target]} ${name} ${currentStep}`.replace(
    / {2}/,
    ' ',
  )
  const metadata = {
    ...defaultParams,
    wizard_progress: `${currentStep} of ${totalSteps}`,
    wizard_name: `Add New ${formattedPlatformNames?.[platform]} ${formattedTargetNames?.[target]} Cluster`,
    ...additionalParams(context),
  }
  Bugsnag.leaveBreadcrumb(event, metadata)
  trackEvent(event, metadata)
}

export const azureClusterTracking = {
  oneClick: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Cluster Setup',
      wizard_state: 'In-Progress',
    },
    currentStep: '1',
    totalSteps: '1',
    name: 'Review',
    additionalParams: (context) => ({
      cluster_name: context?.name,
      cluster_region: context?.region,
      kubernetes_version: context?.kubeRoleVersion,
    }),
  }),
  createStarted: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Start',
      wizard_state: 'Started',
    },
    currentStep: '0',
    totalSteps: '4',
    name: 'Started',
  }),
  wZStepOne: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Initial Setup',
      wizard_state: 'In-Progress',
    },
    currentStep: '1',
    totalSteps: '4',
    name: 'Initial',
    additionalParams: (context) => ({
      cluster_name: context?.name,
      cluster_region: context?.location,
      cluster_template: context?.template,
      kubernetes_version: context?.kubeRoleVersion,
      allow_workloads_on_master: context?.allowWorkloadsOnMaster,
      master_nodes: context?.numMasters,
      worker_nodes: context?.numWorkers,
      master_sku: context?.masterSku,
      worker_sku: context?.workerSku,
      enable_etcd_backup: context?.enableEtcdBackup,
      enable_monitoring: context?.prometheusMonitoringEnabled,
    }),
  }),
  wZStepTwo: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Network Info',
      wizard_state: 'In-Progress',
    },
    currentStep: '2',
    totalSteps: '4',
    name: 'Network',
    additionalParams: (context) => ({
      network_configuration: context?.network,
      network_backend: context?.networkPlugin,
    }),
  }),
  wZStepThree: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Advanced Configuration',
      wizard_state: 'In-Progress',
    },
    currentStep: '3',
    totalSteps: '4',
    name: 'Advanced',
  }),
  wZStepFour: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Review',
      wizard_state: 'Finished',
    },
    currentStep: '4',
    totalSteps: '4',
    name: 'Review',
  }),
  createFinished: generateTrackEventHandler({
    currentStep: '4',
    totalSteps: '4',
    name: 'Finished',
    additionalParams: (context) => ({
      cluster_name: context?.name,
    }),
  }),
}

export const awsClusterTracking = {
  oneClick: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Cluster Setup',
      wizard_state: 'In-Progress',
    },
    currentStep: '1',
    totalSteps: '1',
    name: 'Review',
    additionalParams: (context) => ({
      cluster_name: context?.name,
      cluster_region: context?.region,
      cluster_azs: context?.azs,
      kubernetes_version: context?.kubeRoleVersion,
    }),
  }),
  createStarted: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Start',
      wizard_state: 'Started',
    },
    currentStep: '0',
    totalSteps: '4',
    name: 'Started',
  }),
  wZStepOne: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Initial Setup',
      wizard_state: 'In-Progress',
    },
    currentStep: '1',
    totalSteps: '4',
    name: 'Initial',
    additionalParams: (context) => ({
      cluster_name: context?.name,
      cluster_region: context?.region,
      cluster_azs: context?.azs,
      cluster_template: context?.template,
      kubernetes_version: context?.kubeRoleVersion,
      allow_workloads_on_master: context?.allowWorkloadsOnMaster,
      master_nodes: context?.numMasters,
      worker_nodes: context?.numWorkers,
      master_flavor: context?.masterFlavor,
      worker_flavor: context?.workerFlavor,
      enable_etcd_backup: context?.enableEtcdBackup,
      enable_monitoring: context?.prometheusMonitoringEnabled,
    }),
  }),
  wZStepTwo: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Network Info',
      wizard_state: 'In-Progress',
    },
    currentStep: '2',
    totalSteps: '4',
    name: 'Network',
    additionalParams: (context) => ({
      network_configuration: context?.network,
      network_backend: context?.networkPlugin,
    }),
  }),
  wZStepThree: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Advanced Configuration',
      wizard_state: 'In-Progress',
    },
    currentStep: '3',
    totalSteps: '4',
    name: 'Advanced',
  }),
  wZStepFour: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Review',
      wizard_state: 'Finished',
    },
    currentStep: '4',
    totalSteps: '4',
    name: 'Review',
  }),
  createFinished: generateTrackEventHandler({
    currentStep: '4',
    totalSteps: '4',
    name: 'Finished',
    additionalParams: (context) => ({
      cluster_name: context?.name,
    }),
  }),
}

export const bareOSClusterTracking = {
  oneClick: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Cluster Setup',
      wizard_state: 'In-Progress',
    },
    currentStep: '1',
    totalSteps: '1',
    name: 'Review',
    additionalParams: (context) => ({
      kubernetes_version: context?.kubeRoleVersion,
    }),
  }),
  createStarted: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Start',
      wizard_state: 'Started',
    },
    currentStep: '0',
    totalSteps: '6',
    name: 'Started',
  }),
  wZStepOne: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Initial Setup',
      wizard_state: 'In-Progress',
    },
    currentStep: '1',
    totalSteps: '6',
    name: 'Initial',
    additionalParams: (context) => ({
      cluster_name: context?.name,
      kubernetes_version: context?.kubeRoleVersion,
      allow_workloads_on_master: context?.allowWorkloadsOnMaster,
      privileged: context?.privileged,
      metallb: context?.enableMetallb,
      kubevirt: context?.deployKubevirt,
      networkOperator: context?.deployLuigiOperator,
      enable_etcd_backup: !!context?.enableEtcdBackup,
      enable_monitoring: !!context?.prometheusMonitoringEnabled,
    }),
  }),
  wZStepTwo: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Select Master Nodes',
      wizard_state: 'In-Progress',
    },
    currentStep: '2',
    totalSteps: '6',
    name: 'Masters',
    additionalParams: (context) => ({
      master_nodes: context?.masterNodes?.length || 0,
    }),
  }),
  wZStepThree: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Select Worker Nodes',
      wizard_state: 'In-Progress',
    },
    currentStep: '3',
    totalSteps: '6',
    name: 'Workers',
    additionalParams: (context) => ({
      worker_nodes: context?.workerNodes?.length || 0,
    }),
  }),
  wZStepFour: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Configure Network',
      wizard_state: 'In-Progress',
    },
    currentStep: '4',
    totalSteps: '6',
    name: 'Network',
    additionalParams: (context) => ({
      network_backend: context.networkPlugin,
    }),
  }),
  wZStepFive: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Advanced Configuration',
      wizard_state: 'In-Progress',
    },
    currentStep: '5',
    totalSteps: '6',
    name: 'Advanced',
  }),
  wZStepSix: generateTrackEventHandler({
    defaultParams: {
      wizard_step: 'Review',
      wizard_state: 'Finished',
    },
    currentStep: '6',
    totalSteps: '6',
    name: 'Review',
  }),
  createFinished: generateTrackEventHandler({
    currentStep: '6',
    totalSteps: '6',
    name: 'Finished',
    additionalParams: (context) => ({
      cluster_name: context?.name,
    }),
  }),
}
