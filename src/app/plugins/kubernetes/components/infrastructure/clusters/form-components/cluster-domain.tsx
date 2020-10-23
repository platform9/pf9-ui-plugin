import React from 'react'
import PicklistField from 'core/components/validatedForm/PicklistField'
import ClusterDomainPicklist from '../ClusterDomainPicklist'

const ClusterDomainField = ({ wizardContext, onChange, required = true, disabled = false }) => (
  <PicklistField
    DropdownComponent={ClusterDomainPicklist}
    id="domainId"
    label="Domain"
    onChange={onChange}
    cloudProviderId={wizardContext.cloudProviderId}
    cloudProviderRegionId={wizardContext.cloudProviderRegionId}
    info="Select the base domain name to be used for the API and service FQDNs"
    required={required}
    disabled={disabled}
  />
)

export default ClusterDomainField
