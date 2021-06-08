import ExternalLink from 'core/components/ExternalLink'
import Progress from 'core/components/progress/Progress'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import React, { useEffect, useRef, useMemo } from 'react'
import Text from 'core/elements/text'
import { gettingStartedHelpLink } from 'k8s/links'
import { CloudProviders, CloudProvidersFriendlyName } from '../infrastructure/cloudProviders/model'
import CloudProviderRegionField from '../infrastructure/clusters/form-components/cloud-provider-region'
import SshKeyField from '../infrastructure/clusters/form-components/ssh-key-picklist'
import AwsClusterSshKeyPicklist from '../infrastructure/clusters/aws/AwsClusterSshKeyPicklist'
import SshKeyTextField from '../infrastructure/clusters/form-components/ssh-key-textfield'
import useDataUpdater from 'core/hooks/useDataUpdater'
import { clusterActions } from '../infrastructure/clusters/actions'
import { initialContext as awsInitialContext } from '../infrastructure/clusters/aws/create-templates/one-click'
import { initialContext as azureInitialContext } from '../infrastructure/clusters/azure/create-templates/one-click'
import { awsClusterTracking, azureClusterTracking } from '../infrastructure/clusters/tracking'
import { ClusterCreateTypes } from '../infrastructure/clusters/model'
import AwsAvailabilityZoneField from '../infrastructure/clusters/aws/aws-availability-zone'

const CreateCloudClusterPage = ({ wizardContext, setWizardContext, onNext }) => {
  const [createCluster, creatingCluster] = useDataUpdater(clusterActions.create)
  const validatorRef = useRef(null)
  const defaultValues = useMemo(
    () => (wizardContext.provider === CloudProviders.Aws ? awsInitialContext : azureInitialContext),
    [wizardContext.provider],
  )

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

  const handleSubmit = async () => {
    const isValid = validatorRef.current.validate()
    if (!isValid) {
      return false
    }

    const data = {
      ...defaultValues,
      ...wizardContext,
      segmentTrackingFields,
      clusterType: wizardContext.provider,
      name: wizardContext.clusterName,
      location: wizardContext.region, // We need to add this in for Azure. Azure takes in a location field
    }

    await createCluster(data)
    return true
  }

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
    <Progress loading={creatingCluster} message={'Creating cluster...'}>
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
    </Progress>
  )
}

export default CreateCloudClusterPage
