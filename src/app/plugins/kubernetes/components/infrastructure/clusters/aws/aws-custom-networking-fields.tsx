import ExternalLink from 'core/components/ExternalLink'
import PicklistField from 'core/components/validatedForm/PicklistField'
import { awsNetworkingConfigurationsLink } from 'k8s/links'
import React from 'react'
import ClusterDomainPicklist from '../ClusterDomainPicklist'
import AwsClusterVpcPicklist from './AwsClusterVpcPicklist'
import AwsZoneVpcMappings from './AwsZoneVpcMappings'

const networkOptions = [
  { label: 'Create new VPC (public)', value: 'newPublic' },
  { label: 'Create new VPC (public + private)', value: 'newPublicPrivate' },
  { label: 'Use existing VPC (public)', value: 'existingPublic' },
  { label: 'Use existing VPC (public + private)', value: 'existingPublicPrivate' },
  { label: 'Use existing VPC (private VPN only)', value: 'existingPrivate' },
]

// These fields are only rendered when the user opts to not use a `platform9.net` domain.
const AwsCustomNetworkingFields = ({
  params,
  getParamsUpdater,
  values,
  setFieldValue,
  setWizardContext,
  wizardContext,
}) => {
  const updateFqdns = (value, label) => {
    const name = values.name || wizardContext.name

    const api = `${name}-api.${label}`
    setFieldValue('externalDnsName')(api)
    setWizardContext({ externalDnsName: api })

    const service = `${name}-service.${label}`
    setFieldValue('serviceFqdn')(service)
    setWizardContext({ serviceFdqn: service })
  }

  const renderNetworkFields = ({ network, usePf9Domain }) => {
    switch (network) {
      case 'newPublic':
      case 'newPublicPrivate':
        return null
      case 'existingPublic':
        return (
          <>
            <PicklistField
              DropdownComponent={AwsClusterVpcPicklist}
              id="vpc"
              label="VPC"
              azs={wizardContext.azs}
              onChange={getParamsUpdater('vpcId')}
              cloudProviderId={params.cloudProviderId}
              cloudProviderRegionId={wizardContext.cloudProviderRegionId}
              info=""
              required
              disabled={usePf9Domain}
            />

            <AwsZoneVpcMappings
              type="public"
              cloudProviderId={params.cloudProviderId}
              cloudProviderRegionId={wizardContext.cloudProviderRegionId}
              onChange={getParamsUpdater('subnets')}
              vpcId={params.vpcId}
              azs={wizardContext.azs}
              disabled={usePf9Domain}
            />
          </>
        )
      case 'existingPublicPrivate':
        return (
          <>
            <PicklistField
              DropdownComponent={AwsClusterVpcPicklist}
              id="vpc"
              label="VPC"
              azs={wizardContext.azs}
              onChange={getParamsUpdater('vpcId')}
              cloudProviderId={params.cloudProviderId}
              cloudProviderRegionId={wizardContext.cloudProviderRegionId}
              info=""
              required
              disabled={usePf9Domain}
            />

            <AwsZoneVpcMappings
              type="public"
              cloudProviderId={params.cloudProviderId}
              cloudProviderRegionId={wizardContext.cloudProviderRegionId}
              onChange={getParamsUpdater('subnets')}
              vpcId={params.vpcId}
              azs={wizardContext.azs}
              disabled={usePf9Domain}
            />

            <AwsZoneVpcMappings
              type="private"
              cloudProviderId={params.cloudProviderId}
              cloudProviderRegionId={wizardContext.cloudProviderRegionId}
              onChange={getParamsUpdater('privateSubnets')}
              vpcId={params.vpcId}
              azs={wizardContext.azs}
              disabled={usePf9Domain}
            />
          </>
        )
      case 'existingPrivate':
        return (
          <>
            <PicklistField
              DropdownComponent={AwsClusterVpcPicklist}
              id="vpc"
              label="VPC"
              azs={wizardContext.azs}
              onChange={getParamsUpdater('vpcId')}
              cloudProviderId={params.cloudProviderId}
              cloudProviderRegionId={wizardContext.cloudProviderRegionId}
              info=""
              required
              disabled={usePf9Domain}
            />

            <AwsZoneVpcMappings
              type="private"
              cloudProviderId={params.cloudProviderId}
              cloudProviderRegionId={wizardContext.cloudProviderRegionId}
              onChange={getParamsUpdater('privateSubnets')}
              vpcId={params.vpcId}
              azs={wizardContext.azs}
              disabled={usePf9Domain}
            />
          </>
        )
      default:
        return null
    }
  }

  return (
    <>
      <PicklistField
        DropdownComponent={ClusterDomainPicklist}
        id="domainId"
        label="Domain"
        onChange={updateFqdns}
        cloudProviderId={params.cloudProviderId}
        cloudProviderRegionId={wizardContext.cloudProviderRegionId}
        info="Select the base domain name to be used for the API and service FQDNs"
        required={!values.usePf9Domain}
        disabled={values.usePf9Domain}
      />

      <PicklistField
        id="network"
        label="Network"
        options={networkOptions}
        disabled={values.usePf9Domain}
        info={
          <div>
            Select a network configuration. Read{' '}
            <ExternalLink url={awsNetworkingConfigurationsLink}>this article</ExternalLink> for
            detailed information about each network configuration type.
          </div>
        }
      />
      {renderNetworkFields(values)}
    </>
  )
}

export default AwsCustomNetworkingFields
