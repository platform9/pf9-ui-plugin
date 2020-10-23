/* eslint-disable max-len */
import React, { FC, useEffect, useState } from 'react'
import FormWrapper from 'core/components/FormWrapper'
import Wizard from 'core/components/wizard/Wizard'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useParams from 'core/hooks/useParams'
import useReactRouter from 'use-react-router'
import { clusterActions } from 'k8s/components/infrastructure/clusters/actions'
import { pathJoin } from 'utils/misc'
import { k8sPrefix } from 'app/constants'
import { CloudProviders } from '../../cloudProviders/model'

import { routes } from 'core/utils/routes'
import { ClusterCreateTypes } from '../model'

import WizardMeta from 'core/components/wizard/WizardMeta'
import { getFormTitle } from '../helpers'
import DocumentMeta from 'core/components/DocumentMeta'
import CloudProviderCard from 'k8s/components/common/CloudProviderCard'

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

// const configOnNext = (context) => {
//   trackEvent('WZ New Azure Cluster 1 Master Nodes', {
//     wizard_step: 'Cluster Configuration',
//     wizard_state: 'In-Progress',
//     wizard_progress: '1 of 4',
//     wizard_name: 'Add New Azure Cluster',
//     cluster_name: context.name,
//     cluster_region: context.location,
//     cluster_template: context.template,
//     allow_workloads_on_master: context.allowWorkloadsOnMaster,
//     master_nodes: context.numMasters,
//     worker_nodes: context.numWorkers,
//     master_sku: context.masterSku,
//     worker_sku: context.workerSku,
//   })
// }

// const networkOnNext = (context) => {
//   trackEvent('WZ New Azure Cluster 2 Networking Details', {
//     wizard_step: 'Network Info',
//     wizard_state: 'In-Progress',
//     wizard_progress: '2 of 4',
//     wizard_name: 'Add New Azure Cluster',
//     network_configuration: context.network,
//     network_backend: context.networkPlugin,
//   })
// }

// const advancedOnNext = (context) => {
//   trackEvent('WZ New Azure Cluster 3 Advanced Configuration', {
//     wizard_step: 'Advanced Configuration',
//     wizard_state: 'In-Progress',
//     wizard_progress: '3 of 4',
//     wizard_name: 'Add New Azure Cluster',
//     enable_etcd_backup: !!context.enableEtcdBackup,
//     enable_monitoring: !!context.prometheusMonitoringEnabled,
//   })
// }

// const reviewOnNext = (context) => {
//   trackEvent('WZ New Azure Cluster 4 Review', {
//     wizard_step: 'Review',
//     wizard_state: 'Finished',
//     wizard_progress: '4 of 4',
//     wizard_name: 'Add New Azure Cluster',
//   })
// }

// const initialContext = {
//   template: 'small',
//   masterSku: 'Standard_A1_v2',
//   workerSku: 'Standard_A1_v2',
//   numMasters: 1,
//   numWorkers: 1,
//   enableCAS: false,
//   usePf9Domain: true,
//   network: 'newNetwork',
//   containersCidr: '10.20.0.0/16',
//   servicesCidr: '10.21.0.0/16',
//   networkPlugin: 'flannel',
//   runtimeConfigOption: 'default',
//   useAllAvailabilityZones: true,
//   assignPublicIps: false,
//   etcdStoragePath: defaultEtcBackupPath,
//   etcdBackupInterval: 60 * 24,
//   prometheusMonitoringEnabled: true,
//   tags: [],
//   appCatalogEnabled: false,
// }

// const templateOptions = [
//   { label: 'Sm - Single Node Master & Worker (Standard_A1_v2)', value: 'small' },
//   { label: 'Md - 1 Master + 3 Workers (Standard_A2_v2)', value: 'medium' },
//   { label: 'Lg - 3 Masters + 5 Workers (Standard_A4_v2)', value: 'large' },
//   { label: 'custom', value: 'custom' },
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
//       masterFlavor: 'Standard_A1_v2',
//       workerFlavor: 'Standard_A1_v2',
//     },
//     medium: {
//       numMasters: 1,
//       numWorkers: 3,
//       allowWorkloadsOnMaster: false,
//       masterFlavor: 'Standard_A2_v2',
//       workerFlavor: 'Standard_A2_v2',
//     },
//     large: {
//       numMasters: 3,
//       numWorkers: 5,
//       allowWorkloadsOnMaster: false,
//       masterFlavor: 'Standard_A4_v2',
//       workerFlavor: 'Standard_A4_v2',
//     },
//     custom: {
//       numMasters: 3,
//       numWorkers: 5,
//       allowWorkloadsOnMaster: false,
//       masterFlavor: 'Standard_A4_v2',
//       workerFlavor: 'Standard_A4_v2',
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

// const networkOptions = [
//   { label: 'Select existing', value: 'existing' },
//   { label: 'Create new network', value: 'newNetwork' },
// ]

const AddAzureClusterPage = () => {
  const { params, updateParams, getParamsUpdater } = useParams()
  const { history, match } = useReactRouter()
  const createType = match?.params?.type || ClusterCreateTypes.Custom
  const [activeView, setActiveView] = useState<{ ViewComponent: FC<any> }>(null)
  const [formTitle, setFormTitle] = useState<string>('')
  const [initialContext, setInitialContext] = useState(null)

  useEffect(() => {
    async function loadFile(name) {
      const view = await import(`./create-templates/${name}`)
      setActiveView({ ViewComponent: view.default })
      setFormTitle(view.templateTitle)
      setInitialContext(view.initialContext)
    }
    loadFile(createType)
  }, [createType])

  // useEffect(() => {
  //   trackEvent('WZ New Azure Cluster 0 Started', {
  //     wizard_step: 'Start',
  //     wizard_state: 'Started',
  //     wizard_progress: '0 of 4',
  //     wizard_name: 'Add New Azure Cluster',
  //   })
  // }, [])

  const onComplete = (_, { uuid }) => history.push(routes.cluster.nodeHealth.path({ id: uuid }))
  const [createAzureClusterAction, creatingAzureCluster] = useDataUpdater(
    clusterActions.create,
    onComplete,
  )
  const handleSubmit = (params) => (data) => {
    data.location = params.cloudProviderRegionId
    createAzureClusterAction({ ...data, ...params, clusterType: CloudProviders.Azure })
  }

  const ViewComponent = activeView?.ViewComponent
  return (
    <FormWrapper
      title={getFormTitle(formTitle, createType)}
      backUrl={listUrl}
      loading={creatingAzureCluster}
    >
      <DocumentMeta title={formTitle} bodyClasses={['form-view']} />
      {!!initialContext && (
        <Wizard
          onComplete={handleSubmit(params)}
          context={initialContext}
          originPath={routes.cluster.add.path()}
          showFinishAndReviewButton
        >
          {({ wizardContext, setWizardContext, onNext }) => {
            return (
              <WizardMeta
                fields={wizardContext}
                icon={<CloudProviderCard active type={CloudProviders.Azure} />}
              >
                {ViewComponent && (
                  <ViewComponent
                    wizardContext={wizardContext}
                    setWizardContext={setWizardContext}
                    params={params}
                    updateParams={updateParams}
                    getParamsUpdater={getParamsUpdater}
                    onNext={onNext}
                  />
                )}
              </WizardMeta>
            )
          }}
        </Wizard>
      )}
    </FormWrapper>
  )
}

export default AddAzureClusterPage
