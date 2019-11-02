import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { pathStrOr } from 'utils/fp'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import useDataLoader from 'core/hooks/useDataLoader'
import Picklist from 'core/components/Picklist'
import { loadCloudProviderRegionDetails } from 'k8s/components/infrastructure/cloudProviders/actions'

const AwsClusterVpcPicklist = forwardRef(({
  azs, cloudProviderId, cloudProviderRegionId, hasError, errorMessage, ...rest
}, ref) => {
  const [details, loading] = useDataLoader(loadCloudProviderRegionDetails, { cloudProviderId, cloudProviderRegionId })

  const vpcs = pathStrOr([], '0.vpcs', details)

  // Filter out any VPC's that don't have valid subnets for all the AZ's the user previously selected
  const hasAllAzs = vpc => {
    const azsInVpc = pathStrOr([], 'Subnets', vpc).map(x => x.AvailabilityZone)
    return azs.every(az => azsInVpc.includes(az))
  }

  const toOption = vpc => ({ label: `${vpc.VpcName}-${vpc.CidrBlock}`, value: vpc.VpcId })

  const options = vpcs
    .filter(hasAllAzs)
    .map(toOption)

  return (
    <Picklist
      {...rest}
      ref={ref}
      loading={loading}
      options={options}
      error={hasError}
      helperText={errorMessage}
    />
  )
})

AwsClusterVpcPicklist.propTypes = {
  id: PropTypes.string.isRequired,
  azs: PropTypes.array.isRequired,
  cloudProviderId: PropTypes.string,
  cloudProviderRegionId: PropTypes.string,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}
AwsClusterVpcPicklist.displayName = 'AwsClusterVpcPicklist'

export default AwsClusterVpcPicklist
