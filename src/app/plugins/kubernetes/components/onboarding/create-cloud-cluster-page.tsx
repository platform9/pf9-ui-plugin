import ExternalLink from 'core/components/ExternalLink'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import React, { useEffect, useRef, useMemo, useCallback } from 'react'
import Text from 'core/elements/text'
import { gettingStartedHelpLink } from 'k8s/links'
import { CloudProviders, CloudProvidersFriendlyName } from '../infrastructure/cloudProviders/model'
import CloudProviderRegionField from '../infrastructure/clusters/form-components/cloud-provider-region'
import SshKeyField from '../infrastructure/clusters/form-components/ssh-key-picklist'
import AwsClusterSshKeyPicklist from '../infrastructure/clusters/aws/AwsClusterSshKeyPicklist'
import SshKeyTextField from '../infrastructure/clusters/form-components/ssh-key-textfield'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { clusterActions, loadSupportedRoleVersions } from '../infrastructure/clusters/actions'
import { initialContext as awsInitialContext } from '../infrastructure/clusters/aws/create-templates/one-click'
import { initialContext as azureInitialContext } from '../infrastructure/clusters/azure/create-templates/one-click'
import { awsClusterTracking, azureClusterTracking } from '../infrastructure/clusters/tracking'
import { ClusterCreateTypes } from '../infrastructure/clusters/model'
import AwsAvailabilityZoneField from '../infrastructure/clusters/aws/aws-availability-zone'
import useDataLoader from 'core/hooks/useDataLoader'
import { sort } from 'ramda'
import { compareVersions } from 'k8s/util/helpers'
import { sessionActions } from 'core/session/sessionReducers'
import { useDispatch } from 'react-redux'
import { routes } from 'core/utils/routes'
import { onboardClusterTracking } from './tracking'

const CreateCloudClusterPage = ({
  wizardContext,
  setWizardContext,
  onNext,
  setSubmitting,
  setClusterId,
}) => {
  const dispatch = useDispatch()
  const onComplete = (success, cluster) => {
    if (!success) return
    const clusterNodeUrl = routes.cluster.nodeHealth.path({ id: cluster?.uuid })
    dispatch(sessionActions.updateSession({ onboardingRedirectToUrl: clusterNodeUrl }))
    setClusterId(cluster?.uuid)
  }
  const [createCluster] = useDataUpdater(clusterActions.create, onComplete)
  const validatorRef = useRef(null)
  const defaultValues = useMemo(
    () => (wizardContext.provider === CloudProviders.Aws ? awsInitialContext : azureInitialContext),
    [wizardContext.provider],
  )
  const [kubernetesVersions] = useDataLoader(loadSupportedRoleVersions)
  const defaultKubernetesVersion = useMemo(() => {
    const versionsList = kubernetesVersions?.map((obj) => obj.roleVersion) || []
    const sortedVersions = sort(compareVersions, versionsList) // this sorts the versions from low-high
    return sortedVersions[sortedVersions.length - 1]
  }, [kubernetesVersions])

  const setupValidator = (validate) => {
    validatorRef.current = { validate }
  }

  const segmentTrackingFields = useMemo(
    () => ({
      platform: wizardContext.provider,
      target: ClusterCreateTypes.OneClick,
    }),
    [wizardContext.provider],
  )

  const handleSubmit = useCallback(async () => {
    onboardClusterTracking.wzCreateClusterOnCloud(wizardContext.name, wizardContext.provider)
    const isValid = validatorRef.current.validate()
    if (!isValid) {
      return false
    }

    setSubmitting(true)
    const data = {
      ...defaultValues,
      ...wizardContext,
      segmentTrackingFields,
      clusterType: wizardContext.provider,
      name: wizardContext.clusterName,
      kubeRoleVersion: defaultKubernetesVersion,
      location: wizardContext.region, // We need to add this in for Azure. Azure takes in a location field
    }

    await createCluster(data)
    setSubmitting(false)
    return true
  }, [
    validatorRef.current,
    setSubmitting,
    defaultValues,
    segmentTrackingFields,
    wizardContext,
    defaultKubernetesVersion,
  ])

  useEffect(() => {
    onNext(handleSubmit)
  }, [handleSubmit])

  useEffect(() => {
    if (wizardContext.provider === CloudProviders.Aws) {
      awsClusterTracking.createStarted(segmentTrackingFields)()
      awsClusterTracking.oneClick(segmentTrackingFields)()
    } else if (wizardContext.provider === CloudProviders.Azure) {
      azureClusterTracking.createStarted(segmentTrackingFields)()
      azureClusterTracking.oneClick(segmentTrackingFields)()
    }
  }, [])

  useEffect(() => {
    if (wizardContext.provider === CloudProviders.Aws) {
      awsClusterTracking.createStarted(segmentTrackingFields)()
      awsClusterTracking.oneClick(segmentTrackingFields)()
    } else if (wizardContext.provider === CloudProviders.Azure) {
      azureClusterTracking.createStarted(segmentTrackingFields)()
      azureClusterTracking.oneClick(segmentTrackingFields)()
    }
  }, [wizardContext.provider])

  return (
    <ValidatedForm
      title="Cluster Configuration"
      link={
        <ExternalLink url={gettingStartedHelpLink}>
          <Text variant="caption2">
            {CloudProvidersFriendlyName[wizardContext.provider]} Cluster Help
          </Text>
        </ExternalLink>
      }
      triggerSubmit={setupValidator}
    >
      <CloudProviderRegionField
        cloudProviderType={wizardContext.provider}
        values={wizardContext}
        onChange={(value) => setWizardContext({ region: value, azs: [] })}
        wizardContext={wizardContext}
      />

      {wizardContext.provider === CloudProviders.Aws && (
        <>
          {wizardContext.region && (
            <AwsAvailabilityZoneField
              values={wizardContext}
              wizardContext={wizardContext}
              setWizardContext={setWizardContext}
              allowMultiSelect={false}
            />
          )}
          <SshKeyField
            dropdownComponent={AwsClusterSshKeyPicklist}
            values={wizardContext}
            wizardContext={wizardContext}
            setWizardContext={setWizardContext}
          />
        </>
      )}

      {wizardContext.provider === CloudProviders.Azure && (
        <SshKeyTextField wizardContext={wizardContext} setWizardContext={setWizardContext} />
      )}
    </ValidatedForm>
  )
}

export default CreateCloudClusterPage
