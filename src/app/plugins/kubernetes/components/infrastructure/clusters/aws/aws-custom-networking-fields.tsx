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
const AwsCustomNetworkingFields = ({ setWizardContext, wizardContext }) => {
  const updateFqdns = (value, label) => {
    const name = wizardContext.name

    const api = `${name}-api.${label}`
    setWizardContext({ externalDnsName: api })

    const service = `${name}-service.${label}`
    setWizardContext({ serviceFqdn: service })
  }

  const renderNetworkFields = (wizardContext, setWizardContext) => {
    switch (wizardContext.network) {
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
              onChange={(value) => setWizardContext({ vpc: value })}
              cloudProviderId={wizardContext.cloudProviderId}
              cloudProviderRegionId={wizardContext.region}
              info=""
              required
              disabled={wizardContext.usePf9Domain}
            />

            <AwsZoneVpcMappings
              type="public"
              cloudProviderId={wizardContext.cloudProviderId}
              cloudProviderRegionId={wizardContext.region}
              onChange={(value) => setWizardContext({ subnets: value })}
              vpcId={wizardContext.vpc}
              azs={wizardContext.azs}
              disabled={wizardContext.usePf9Domain}
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
              onChange={(value) => setWizardContext({ vpc: value })}
              cloudProviderId={wizardContext.cloudProviderId}
              cloudProviderRegionId={wizardContext.region}
              info=""
              required
              disabled={wizardContext.usePf9Domain}
            />

            <AwsZoneVpcMappings
              type="public"
              cloudProviderId={wizardContext.cloudProviderId}
              cloudProviderRegionId={wizardContext.region}
              onChange={(value) => setWizardContext({ subnets: value })}
              vpcId={wizardContext.vpc}
              azs={wizardContext.azs}
              disabled={wizardContext.usePf9Domain}
            />

            <AwsZoneVpcMappings
              type="private"
              cloudProviderId={wizardContext.cloudProviderId}
              cloudProviderRegionId={wizardContext.region}
              onChange={(value) => setWizardContext({ privateSubnets: value })}
              vpcId={wizardContext.vpc}
              azs={wizardContext.azs}
              disabled={wizardContext.usePf9Domain}
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
              onChange={(value) => setWizardContext({ vpc: value })}
              cloudProviderId={wizardContext.cloudProviderId}
              cloudProviderRegionId={wizardContext.region}
              info=""
              required
              disabled={wizardContext.usePf9Domain}
            />

            <AwsZoneVpcMappings
              type="private"
              cloudProviderId={wizardContext.cloudProviderId}
              cloudProviderRegionId={wizardContext.region}
              onChange={(value) => setWizardContext({ privateSubnets: value })}
              vpcId={wizardContext.vpc}
              azs={wizardContext.azs}
              disabled={wizardContext.usePf9Domain}
            />
          </>
        )
      default:
        return null
    }
  }

  return (
    <>
      {wizardContext.useRoute53 && (
        <PicklistField
          DropdownComponent={ClusterDomainPicklist}
          id="domainId"
          label="Domain"
          onChange={updateFqdns}
          cloudProviderId={wizardContext.cloudProviderId}
          cloudProviderRegionId={wizardContext.region}
          info="Select the base domain name to be used for the API and service FQDNs"
          required={!wizardContext.usePf9Domain}
          disabled={wizardContext.usePf9Domain}
        />
      )}

      <PicklistField
        id="network"
        label="Network"
        options={networkOptions}
        onChange={(value) => setWizardContext({ network: value })}
        disabled={wizardContext.usePf9Domain}
        info={
          <div>
            Select a network configuration. Read{' '}
            <ExternalLink url={awsNetworkingConfigurationsLink}>this article</ExternalLink> for
            detailed information about each network configuration type.
          </div>
        }
      />
      {renderNetworkFields(wizardContext, setWizardContext)}
    </>
  )
}

export default AwsCustomNetworkingFields
