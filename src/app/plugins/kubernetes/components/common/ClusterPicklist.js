import React, { useMemo } from 'react'
import Picklist from 'core/components/Picklist'
import { projectAs, isTruthy } from 'utils/fp'
import { castFuzzyBool } from 'utils/misc'
import { propSatisfies, compose, path, pipe, when, always, filter } from 'ramda'
import useDataLoader from 'core/hooks/useDataLoader'
import PropTypes from 'prop-types'

const hasMasterNode = propSatisfies(isTruthy, 'hasMasterNode')
const hasPrometheusEnabled = compose(castFuzzyBool, path(['tags', 'pf9-system:monitoring']))

const ClusterPicklist = ({ loading, onlyPrometheusEnabled, onlyMasterNodeClusters, showAll, ...rest }) => {
  const [clusters, clustersLoading] = useDataLoader('clusters')
  const options = useMemo(() => projectAs(
    { label: 'name', value: 'uuid' },
    pipe(
      when(always(onlyMasterNodeClusters), filter(hasMasterNode)),
      when(always(onlyPrometheusEnabled), filter(hasPrometheusEnabled)),
    )(clusters),
  ), [clusters, onlyMasterNodeClusters, onlyPrometheusEnabled])

  return <Picklist
    {...rest}
    loading={loading || clustersLoading}
    options={options}
  />
}

ClusterPicklist.propTypes = {
  ...Picklist.propTypes,
  name: PropTypes.string,
  label: PropTypes.string,
  onlyMasterNodeClusters: PropTypes.bool,
  onlyPrometheusEnabled: PropTypes.bool,
}

ClusterPicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'clusterId',
  label: 'Current Cluster',
  onlyMasterNodeClusters: true,
  onlyPrometheusEnabled: false
}

export default ClusterPicklist
