import React, { useMemo, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  isEmpty, propOr, head, compose, filter, identity, omit, path, pipe, propSatisfies,
} from 'ramda'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { isTruthy, projectAs } from 'utils/fp'
import { castFuzzyBool } from 'utils/misc'
import { clustersDataKey } from '../infrastructure/actions'
import { allKey } from 'app/constants'

const hasMasterNode = propSatisfies(isTruthy, 'hasMasterNode')
const hasPrometheusEnabled = compose(castFuzzyBool, path(['tags', 'pf9-system:monitoring']))

const ClusterPicklist = ({ loading, onChange, value, onlyPrometheusEnabled, onlyMasterNodeClusters, showAll, ...rest }) => {
  const [clusters, clustersLoading] = useDataLoader(clustersDataKey)
  const options = useMemo(() => pipe(
    onlyMasterNodeClusters ? filter(hasMasterNode) : identity,
    onlyPrometheusEnabled ? filter(hasPrometheusEnabled) : identity,
    projectAs({ label: 'name', value: 'uuid' })
  )(clusters),
  [clusters, onlyMasterNodeClusters, onlyPrometheusEnabled])

  // Select the first cluster as soon as clusters are loaded
  useEffect(() => {
    if (!isEmpty(options)) {
      onChange(propOr(allKey, 'value', head(options)))
    }
  }, [options])

  return <Picklist
    {...rest}
    onChange={onChange}
    disabled={isEmpty(options)}
    value={value || propOr(allKey, 'value', head(options))}
    loading={loading || clustersLoading}
    options={options}
  />
}

ClusterPicklist.propTypes = {
  ...omit(['options'], Picklist.propTypes),
  name: PropTypes.string,
  label: PropTypes.string,
  formField: PropTypes.bool,
  onlyMasterNodeClusters: PropTypes.bool,
  onlyPrometheusEnabled: PropTypes.bool,
}

ClusterPicklist.defaultProps = {
  ...Picklist.defaultProps,
  name: 'clusterId',
  label: 'Current Cluster',
  formField: false,
  onlyMasterNodeClusters: true,
  onlyPrometheusEnabled: false
}

export default ClusterPicklist
