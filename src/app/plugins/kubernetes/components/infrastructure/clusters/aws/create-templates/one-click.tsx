import React from 'react'
import ExternalLink from 'core/components/ExternalLink'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import PicklistField from 'core/components/validatedForm/PicklistField'
import ValidatedForm from 'core/components/validatedForm/ValidatedForm'
import { routes } from 'core/utils/routes'
import AwsAvailabilityZoneChooser from 'k8s/components/infrastructure/cloudProviders/AwsAvailabilityZoneChooser'
import { CloudProviders } from 'k8s/components/infrastructure/cloudProviders/model'
import { PromptToAddProvider } from 'k8s/components/infrastructure/cloudProviders/PromptToAddProvider'
import { awsPrerequisitesLink } from 'k8s/links'
import Text from 'core/elements/text'
import CloudProvider from '../../form-components/cloud-provider'
import Name from '../../form-components/name'
import AwsClusterSshKeyPickList from '../AwsClusterSshKeyPicklist'
import ClusterDomainPicklist from '../../ClusterDomainPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { cloudProviderActions } from 'k8s/components/infrastructure/cloudProviders/actions'

export const templateTitle = 'One Click'

const OneClickAwsCluster = ({ wizardContext, setWizardContext, params, getParamsUpdater }) => {
  const [cloudProviders, loading] = useDataLoader(cloudProviderActions.list)
  const hasAwsProvider = !!cloudProviders.some((provider) => provider.type === CloudProviders.Aws)

  const updateFqdns = (values, setFieldValue) => (value, label) => {
    const name = values.name || wizardContext.name

    const api = `${name}-api.${label}`
    setFieldValue('externalDnsName')(api)
    setWizardContext({ externalDnsName: api })

    const service = `${name}-service.${label}`
    setFieldValue('serviceFqdn')(service)
    setWizardContext({ serviceFdqn: service })
  }

  const handleClusterDomainUpdate = (values, setFieldValues) => updateFqdns(values, setFieldValues)

  return (
    <>
      {loading ? null : hasAwsProvider ? (
        <ValidatedForm
          initialValues={wizardContext}
          onSubmit={setWizardContext}
          // triggerSubmit={onNext}
          title="Configure Your Cluster"
        >
          {({ setFieldValue, values }) => (
            <>
              <FormFieldCard
                title="Cluster Configuration"
                link={
                  <ExternalLink url={awsPrerequisitesLink}>
                    <Text variant="caption2">AWS Cluster Help</Text>
                  </ExternalLink>
                }
              >
                <Name setWizardContext={setWizardContext} />

                {/* Cloud Provider and Region */}
                <CloudProvider
                  wizardContext
                  setWizardContext
                  params
                  getParamsUpdater
                  cloudProviderType={CloudProviders.Aws}
                />

                {/* AWS Availability Zone */}
                {values.region && (
                  <AwsAvailabilityZoneChooser
                    id="azs"
                    info="Select from the Availability Zones for the specified region"
                    cloudProviderId={params.cloudProviderId}
                    cloudProviderRegionId={wizardContext.cloudProviderRegionId}
                    onChange={(value) => setWizardContext({ azs: value })}
                    values={wizardContext.azs}
                    type="aws"
                    required
                  />
                )}

                {/* SSH Key */}
                <PicklistField
                  DropdownComponent={AwsClusterSshKeyPickList}
                  disabled={!(params.cloudProviderId && wizardContext.cloudProviderRegionId)}
                  id="sshKey"
                  label="SSH Key"
                  cloudProviderId={params.cloudProviderId}
                  cloudProviderRegionId={wizardContext.cloudProviderRegionId}
                  info="Select an AWS SSH key to be associated with the nodes. This key can be used to access the nodes for debugging or other purposes."
                  required
                />

                {/* Domain */}
                <PicklistField
                  DropdownComponent={ClusterDomainPicklist}
                  id="domainId"
                  label="Domain"
                  onChange={handleClusterDomainUpdate(values, setFieldValue)}
                  cloudProviderId={params.cloudProviderId}
                  cloudProviderRegionId={wizardContext.cloudProviderRegionId}
                  info="Select the base domain name to be used for the API and service FQDNs"
                  required={!values.usePf9Domain}
                  disabled={values.usePf9Domain}
                />
              </FormFieldCard>
            </>
          )}
        </ValidatedForm>
      ) : (
        <FormFieldCard title="Configure Your Cluster">
          <PromptToAddProvider
            type={CloudProviders.Aws}
            src={routes.cloudProviders.add.path({ type: CloudProviders.Aws })}
          />
        </FormFieldCard>
      )}
    </>
  )
}

export default OneClickAwsCluster
