import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { pathStrOr, projectAs } from 'app/utils/fp'
import { groupBy, prop, propEq } from 'ramda'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import PicklistField from 'core/components/validatedForm/PicklistField'
import { loadCloudProviderRegionDetails } from './actions'

/* Displays multiple picklists to allow the user to specify a subnet for each AZ in the VPC */
const VpcSubnets = ({ type, cloudProviderId, cloudProviderRegionId, vpcId, onChange }) => {
  const [details] = useDataLoader(loadCloudProviderRegionDetails, { cloudProviderId, cloudProviderRegionId })
  const [subnetMappings, setSubnetMappings] = useState({})

  const vpcs = pathStrOr([], '0.vpcs', details)
  const vpc = vpcs.find(propEq('VpcId', vpcId))

  if (!vpc) {
    console.error(`Cannot find VPC (${vpcId})`)
    return null
  }

  const isPublic = type === 'public'
  const options = vpc.Subnets.filter(x => x.MapPublicIpOnLaunch === isPublic)
  const subnetsByAz = groupBy(prop('AvailabilityZone'), options)

  const handleChange = az => subnetId => {
    setSubnetMappings({ ...subnetMappings, [az]: subnetId })
    onChange && onChange(subnetMappings)
  }

  return (
    <React.Fragment>
      {Object.keys(subnetsByAz).map(az => (
        <PicklistField
          key={az}
          id={az}
          options={projectAs({ label: 'Cidrblock', value: 'SubnetId' }, subnetsByAz[az])}
          onChange={handleChange(az)}
          info=""
        />
      ))}
    </React.Fragment>
  )
}

VpcSubnets.propTypes = {
  cloudProviderId: PropTypes.string.isRequired,
  cloudProviderRegionId: PropTypes.string.isRequired,
  vpcId: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}

export default VpcSubnets
