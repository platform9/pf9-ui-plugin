import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { pathStrOr, projectAs } from 'utils/fp'
import { groupBy, prop, propEq } from 'ramda'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import PicklistField from 'core/components/validatedForm/PicklistField'
import { loadCloudProviderRegionDetails } from 'k8s/components/infrastructure/cloudProviders/actions'

/* Displays multiple picklists to allow the user to specify a subnet for each AZ in the VPC */
const AwsZoneVpcMappings = ({ azs=[], type, cloudProviderId, cloudProviderRegionId, vpcId, onChange }) => {
  if (!vpcId) return null
  const [details] = useDataLoader(loadCloudProviderRegionDetails, { cloudProviderId, cloudProviderRegionId })
  const [subnetMappings, setSubnetMappings] = useState({})

  const vpcs = pathStrOr([], '0.vpcs', details)
  const vpc = vpcs.find(propEq('VpcId', vpcId))

  if (!vpc) return null

  const isPublic = type === 'public'

  const subnets = pathStrOr([], 'Subnets', vpc)
  const options = subnets
    .filter(x => x.MapPublicIpOnLaunch === isPublic && azs.includes(x.AvailabilityZone))
  const subnetsByAz = groupBy(prop('AvailabilityZone'), options)

  const handleChange = az => subnetId => {
    const mappings = { ...subnetMappings, [az]: subnetId }
    setSubnetMappings(mappings)
    onChange && onChange(Object.values(mappings))
  }

  return (
    <>
      {Object.keys(subnetsByAz).map(az => (
        <PicklistField
          label={`Availability Zone (${type}): ${az}`}
          key={`az-subnet-${type}-${az}-${az.CidrBlock}`}
          id={`az-subnet-${type}-${az}`}
          options={projectAs({ label: 'CidrBlock', value: 'SubnetId' }, subnetsByAz[az])}
          onChange={handleChange(az)}
          info=""
        />
      ))}
    </>
  )
}

AwsZoneVpcMappings.propTypes = {
  azs: PropTypes.array.isRequired,
  type: PropTypes.oneOf(['public', 'private']).isRequired,
  cloudProviderId: PropTypes.string.isRequired,
  cloudProviderRegionId: PropTypes.string.isRequired,
  vpcId: PropTypes.string,
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}

AwsZoneVpcMappings.displayName = 'AwsZoneVpcMappings'

export default AwsZoneVpcMappings
