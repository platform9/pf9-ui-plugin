/* eslint-disable max-len */
import React, { FC, useEffect, useState } from 'react'
import FormWrapper from 'core/components/FormWrapper'
import Wizard from 'core/components/wizard/Wizard'
import WizardMeta from 'core/components/wizard/WizardMeta'
import CloudProviderCard from 'k8s/components/common/CloudProviderCard'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useParams from 'core/hooks/useParams'
import useReactRouter from 'use-react-router'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { pathJoin } from 'utils/misc'
import { defaultEtcBackupPath, k8sPrefix } from 'app/constants'
import { CloudProviders } from '../../cloudProviders/model'
import { routes } from 'core/utils/routes'
import { ClusterCreateTypes } from '../model'
import { getFormTitle } from '../helpers'
import DocumentMeta from 'core/components/DocumentMeta'

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

// Segment tracking for wizard steps
// const configOnNext = (context) => {
//   trackEvent('WZ New AWS Cluster 1 Master Nodes', {
//     wizard_step: 'Cluster Configuration',
//     wizard_state: 'In-Progress',
//     wizard_progress: '1 of 4',
//     wizard_name: 'Add New AWS Cluster',
//     cluster_name: context.name,
//     cluster_region: context.region,
//     cluster_azs: context.azs,
//     cluster_template: context.template,
//     allow_workloads_on_master: context.allowWorkloadsOnMaster,
//     master_nodes: context.numMasters,
//     worker_nodes: context.numWorkers,
//     master_flavor: context.masterFlavor,
//     worker_flavor: context.workerFlavor,
//   })
// }

// const networkOnNext = (context) => {
//   trackEvent('WZ New AWS Cluster 2 Networking Details', {
//     wizard_step: 'Network Info',
//     wizard_state: 'In-Progress',
//     wizard_progress: '2 of 4',
//     wizard_name: 'Add New AWS Cluster',
//     network_configuration: context.network,
//     network_backend: context.networkPlugin,
//   })
// }

// const advancedOnNext = (context) => {
//   trackEvent('WZ New AWS Cluster 3 Advanced Configuration', {
//     wizard_step: 'Advanced Configuration',
//     wizard_state: 'In-Progress',
//     wizard_progress: '3 of 4',
//     wizard_name: 'Add New AWS Cluster',
//     enable_etcd_backup: !!context.enableEtcdBackup,
//     enable_monitoring: !!context.prometheusMonitoringEnabled,
//   })
// }

// const reviewOnNext = (context) => {
//   trackEvent('WZ New AWS Cluster 4 Review', {
//     wizard_step: 'Review',
//     wizard_state: 'Finished',
//     wizard_progress: '4 of 4',
//     wizard_name: 'Add New AWS Cluster',
//   })
// }

const initialContext = {
  template: 'small',
  ami: 'ubuntu',
  masterFlavor: 't2.medium',
  workerFlavor: 't2.medium',
  numMasters: 1,
  numWorkers: 1,
  enableCAS: false,
  usePf9Domain: false,
  network: 'newPublic',
  containersCidr: '10.20.0.0/16',
  servicesCidr: '10.21.0.0/16',
  networkPlugin: 'flannel',
  mtuSize: 1440,
  runtimeConfigOption: 'default',
  isPrivate: false,
  internalElb: false,
  etcdStoragePath: defaultEtcBackupPath,
  etcdBackupInterval: 60 * 24, // in minutes
  prometheusMonitoringEnabled: true,
  tags: [],
  appCatalogEnabled: false,
}

// const templateOptions = [
//   { label: 'Sm - Single Node Master & Worker (t2.medium)', value: 'small' },
//   { label: 'Md - 1 Master + 3 Workers (t2.medium)', value: 'medium' },
//   { label: 'Lg - 3 Masters + 5 Workers (t2.large)', value: 'large' },
//   { label: 'custom', value: 'custom' },
// ]

// const operatingSystemOptions = [
//   { label: 'Ubuntu', value: 'ubuntu' },
//   { label: 'CentOS', value: 'centos' },
// ]

// The template picker allows the user to fill out some useful defaults for the fields.
// This greatly simplifies the number of fields that need to be filled out.
// Presets are as follows:
// small (single dev) - 1 node master + worker - select instance type (default t2.small)
// medium (internal team) - 1 master + 3 workers - select instance (default t2.medium)
// large (production) - 3 master + 5 workers - no workload on masters (default t2.large)
// const handleTemplateChoice = ({ setWizardContext, setFieldValue, paramUpdater }) => (option) => {
//   const options = {
//     small: {
//       numMasters: 1,
//       numWorkers: 0,
//       allowWorkloadsOnMaster: true,
//       masterFlavor: 't2.medium',
//       workerFlavor: 't2.medium',
//     },
//     medium: {
//       numMasters: 1,
//       numWorkers: 3,
//       allowWorkloadsOnMaster: false,
//       masterFlavor: 't2.medium',
//       workerFlavor: 't2.medium',
//     },
//     large: {
//       numMasters: 3,
//       numWorkers: 5,
//       allowWorkloadsOnMaster: false,
//       masterFlavor: 't2.large',
//       workerFlavor: 't2.large',
//     },
//     custom: {
//       numMasters: 3,
//       numWorkers: 5,
//       allowWorkloadsOnMaster: false,
//       masterFlavor: 't2.large',
//       workerFlavor: 't2.large',
//     },
//   }

//   paramUpdater(option)

//   // setImmediate is used because we need the fields to show up in the form before their values can be set
//   setImmediate(() => {
//     setWizardContext(options[option])
//     Object.entries(options[option]).forEach(([key, value]) => {
//       setFieldValue(key)(value)
//     })
//   })
// }

// const networkPluginOptions = [
//   { label: 'Flannel', value: 'flannel' },
//   { label: 'Calico', value: 'calico' },
//   // { label: 'Canal (experimental)', value: 'canal' },
// ]

// const handleNetworkPluginChange = (option, wizardContext) => {
//   const payload = {
//     networkPlugin: option,
//     privileged: option === 'calico' ? true : wizardContext.privileged,
//     calicoIpIpMode: option === 'calico' ? 'Always' : undefined,
//     calicoNatOutgoing: option === 'calico' ? true : undefined,
//     calicoV4BlockSize: option === 'calico' ? '24' : undefined,
//   }
//   return payload
// }

const AddAwsClusterPage = () => {
  const { params, getParamsUpdater } = useParams()
  const { history, match } = useReactRouter()
  const createType = match?.params?.type || ClusterCreateTypes.Custom
  const [activeView, setActiveView] = useState<{ ViewComponent: FC<any> }>(null)
  const [formTitle, setFormTitle] = useState<string>('')

  useEffect(() => {
    async function loadFile(name) {
      const view = await import(`./create-templates/${name}`)
      setActiveView({ ViewComponent: view.default })
      setFormTitle(view.templateTitle)
    }
    loadFile(createType)
  }, [createType])

  // useEffect(() => {
  //   trackEvent('WZ New AWS Cluster 0 Started', {
  //     wizard_step: 'Start',
  //     wizard_state: 'Started',
  //     wizard_progress: '0 of 4',
  //     wizard_name: 'Add New AWS Cluster',
  //   })
  // }, [])

  const onComplete = (_, { uuid }) => history.push(routes.cluster.nodeHealth.path({ id: uuid }))
  const [createAwsClusterAction, creatingAwsCluster] = useDataUpdater(
    clusterActions.create,
    onComplete,
  )
  const handleSubmit = (params) => (data) =>
    createAwsClusterAction({ ...data, ...params, clusterType: CloudProviders.Aws })

  const ViewComponent = activeView?.ViewComponent
  return (
    <FormWrapper
      title={getFormTitle(formTitle, createType)}
      backUrl={listUrl}
      loading={creatingAwsCluster}
    >
      <DocumentMeta title={formTitle} bodyClasses={['form-view']} />
      {!!initialContext && (
        <Wizard
          onComplete={handleSubmit(params)}
          context={initialContext}
          originPath={routes.cluster.add.path({ type: CloudProviders.Aws })}
        >
          {({ wizardContext, setWizardContext, onNext }) => (
            <WizardMeta
              fields={wizardContext}
              icon={<CloudProviderCard active type={CloudProviders.Aws} />}
            >
              {ViewComponent && (
                <ViewComponent
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
                  params={params}
                  getParamsUpdater={getParamsUpdater}
                  onNext={onNext}
                />
              )}
            </WizardMeta>
          )}
        </Wizard>
      )}
    </FormWrapper>
  )
}

export default AddAwsClusterPage
