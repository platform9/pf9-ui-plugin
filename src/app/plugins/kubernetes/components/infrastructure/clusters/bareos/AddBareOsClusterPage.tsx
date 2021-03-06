import React, { FC, useEffect, useState } from 'react'
import FormWrapper from 'core/components/FormWrapper'
import Wizard from 'core/components/wizard/Wizard'
import useDataUpdater from 'core/hooks/useDataUpdater'
import useReactRouter from 'use-react-router'
import { clusterActions } from '../actions'
import { pathJoin } from 'utils/misc'
import { k8sPrefix } from 'app/constants'
import { routes } from 'core/utils/routes'
import WizardMeta from 'core/components/wizard/WizardMeta'
import { ClusterCreateTypeNames, ClusterCreateTypes } from '../model'
import CloudProviderCard from 'k8s/components/common/CloudProviderCard'
import { CloudProviders } from '../../cloudProviders/model'
import DocumentMeta from 'core/components/DocumentMeta'
import { getFormTitle } from '../helpers'
import { bareOSClusterTracking } from '../tracking'

const listUrl = pathJoin(k8sPrefix, 'infrastructure')

const canFinishAndReview = (createType) => ({
  masterNodes,
  workerNodes,
  allowWorkloadsOnMaster,
  masterVipIpv4,
  masterVipIface,
}) => {
  const hasMasters = !!masterNodes && masterNodes.length > 0
  const hasOneMaster = hasMasters && masterNodes.length === 1
  const hasMultipleMasters = hasMasters && masterNodes.length >= 1
  const hasWorkers = !!workerNodes && workerNodes.length > 0
  if (createType === ClusterCreateTypes.SingleMaster) {
    return hasOneMaster && (!!allowWorkloadsOnMaster || hasWorkers)
  }
  if (createType === ClusterCreateTypes.MultiMaster) {
    return hasMultipleMasters && !!masterVipIpv4 && !!masterVipIface
  }

  return false
}

const wizardMetaFormattedNames = {
  name: 'Cluster Name',
  masterNodes: 'Master Nodes',
  workerNodes: 'Worker Nodes',
  networkPlugin: 'CNI',
}
const wizardMetaCalloutFields = ['name', 'masterNodes', 'workerNodes', 'networkPlugin']

const AddBareOsClusterPage = () => {
  const { history, match } = useReactRouter()
  const createType = match?.params?.type || ClusterCreateTypes.Custom
  const providerType = match?.params?.platform || CloudProviders.VirtualMachine
  const [activeView, setActiveView] = useState<{ ViewComponent: FC<any> }>(null)
  const [formTitle, setFormTitle] = useState<string>('')
  const [initialContext, setInitialContext] = useState(null)

  const segmentTrackingFields = {
    platform: providerType,
    target: createType,
  }

  useEffect(() => {
    async function loadFile(name, provider) {
      const view = await import(`./create-templates/${provider}-${name}`)
      setActiveView({ ViewComponent: view.default })
      setFormTitle(ClusterCreateTypeNames[name])
      setInitialContext(view.initialContext)
    }
    loadFile(createType, providerType)
  }, [createType, providerType])

  useEffect(() => {
    bareOSClusterTracking.createStarted(segmentTrackingFields)()
  }, [])

  const onComplete = (_, { uuid }) => history.push(routes.cluster.nodeHealth.path({ id: uuid }))

  const [createBareOSClusterAction, creatingBareOSCluster] = useDataUpdater(
    clusterActions.create,
    onComplete,
  )

  const handleSubmit = (data) =>
    createBareOSClusterAction({
      ...data,
      clusterType: 'local',
      segmentTrackingFields,
    })

  const title = getFormTitle(formTitle, createType)

  const ViewComponent = activeView?.ViewComponent
  return (
    <FormWrapper title={title} backUrl={listUrl} loading={creatingBareOSCluster}>
      <DocumentMeta title={title} bodyClasses={['form-view']} />
      {!!initialContext && (
        <Wizard
          onComplete={handleSubmit}
          context={initialContext}
          originPath={routes.cluster.add.path({ type: providerType })}
          showFinishAndReviewButton={canFinishAndReview(createType)}
        >
          {({ wizardContext, setWizardContext, onNext }) => (
            <WizardMeta
              fields={wizardContext}
              icon={<CloudProviderCard active type={providerType} />}
              keyOverrides={wizardMetaFormattedNames}
              calloutFields={wizardMetaCalloutFields}
            >
              {ViewComponent && (
                <ViewComponent
                  wizardContext={wizardContext}
                  setWizardContext={setWizardContext}
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

export default AddBareOsClusterPage
