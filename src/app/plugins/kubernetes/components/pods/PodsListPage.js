import React, { useCallback } from 'react'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { podActions } from 'k8s/components/pods/actions'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs, allKey } from 'app/constants'
import { toPairs, pick } from 'ramda'
import ExternalLink from 'core/components/ExternalLink'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { objSwitchCase } from 'utils/fp'
import moment from 'moment'
import { secondsToString } from 'utils/misc'

const useStyles = makeStyles(theme => ({
  status: {
    display: 'inline-flex',
    alignItems: 'end',
    '&:before': {
      content: '\' \'',
      height: 14,
      width: 14,
      marginRight: 3,
      borderRadius: '50%',
      display: ({ status }) => !status || status === 'loading' ? 'none' : 'inline-block',
      backgroundColor: ({ status }) => objSwitchCase({
        ok: '#31DA6D',
        pending: '#FEC35D',
        fail: '#F16E3F',
      }, '#F16E3F')(status),
    },
  },
  labels: {
    color: '#31DA6D',
  },
}))

const defaultParams = {
  masterNodeClusters: true,
}
const usePrefParams = createUsePrefParamsHook('Pods', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, updateParams, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(podActions.list, params)
    const updateClusterId = useCallback(clusterId => {
      updateParams({
        clusterId,
        namespace: allKey
      })
    }, [])
    return <ListContainer
      loading={loading}
      reload={reload}
      data={data}
      getParamsUpdater={getParamsUpdater}
      filters={<>
        <ClusterPicklist
          onChange={updateClusterId}
          value={params.clusterId}
          onlyMasterNodeClusters
        />
        <NamespacePicklist
          selectFirst={false}
          onChange={getParamsUpdater('namespace')}
          value={params.namespace}
          clusterId={params.clusterId}
          disabled={!params.clusterId}
        />
      </>}
      {...pick(listTablePrefs, params)}
    />
  }
}
const renderPodName = (name, { dashboardUrl }) => {
  return <span>
    {name}<br />
    <ExternalLink url={dashboardUrl}>dashboard
      <FontAwesomeIcon size="sm">file-alt</FontAwesomeIcon></ExternalLink>
  </span>
}

const greenStyle = { color: '#00C036', fontWeight: 400 }
const renderLabels = labels => {
  return <Typography style={greenStyle} variant="body2" component="div">
    {toPairs(labels).map(([name, value]) =>
      <p key={name}>{name}: {value}</p>)}
  </Typography>
}

const PodsStatusSpan = props => {
  const { children } = props
  const { status } = useStyles(props)
  return <div className={status}>{children}</div>
}

const renderStatus = phase => {
  switch (phase) {
    case 'Running':
    case 'Succeeded':
      return <PodsStatusSpan status="ok">
        {phase}
      </PodsStatusSpan>

    case 'Failed':
      return <PodsStatusSpan status="fail">
        {phase}
      </PodsStatusSpan>

    case 'Pending':
    case 'Unknown':
    default:
      return <PodsStatusSpan status="pending">
        {phase}
      </PodsStatusSpan>
  }
}

const renderAge = created => {
  return secondsToString(moment().diff(created, 's'))
}

export const options = {
  addUrl: '/ui/kubernetes/pods/add',
  addText: 'Create New Pod',
  columns: [
    { id: 'name', label: 'Name', render: renderPodName },
    { id: 'clusterName', label: 'Cluster' },
    { id: 'namespace', label: 'Namespace' },
    { id: 'labels', label: 'Labels', render: renderLabels },
    { id: 'status.phase', label: 'Status', render: renderStatus },
    { id: 'status.hostIP', label: 'Node IP' },
    { id: 'created', label: 'Age', render: renderAge },
  ],
  name: 'Pods',
  title: 'Pods',
  ListPage,
}
const components = createCRUDComponents(options)
export const PodsList = components.List

export default components.ListPage
