import React, { useCallback } from 'react'
import { makeStyles } from '@material-ui/styles'
import createCRUDComponents from 'core/helpers/createCRUDComponents'
import ClusterPicklist from 'k8s/components/common/ClusterPicklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { createUsePrefParamsHook } from 'core/hooks/useParams'
import { listTablePrefs, allKey } from 'app/constants'
import { pick } from 'ramda'
import NamespacePicklist from 'k8s/components/common/NamespacePicklist'
// import { DateAndTime } from 'core/components/listTable/cells/DateCell'
import { routes } from 'core/utils/routes'
// import { trackEvent } from 'utils/tracking'
// import SimpleLink from 'core/components/SimpleLink'
import { virtualMachineActions } from './actions'
// import ClusterStatusSpan from '../infrastructure/clusters/ClusterStatus'
// import { importedClusterStatusMap } from '../infrastructure/importedClusters/model'
import renderLabels from '../pods/renderLabels'
import { DateAndTime } from 'core/components/listTable/cells/DateCell'
import Theme from 'core/themes/model'
import SimpleLink from 'core/components/SimpleLink'

const defaultParams = {
  clusterId: allKey,
}
const usePrefParams = createUsePrefParamsHook('Pods', listTablePrefs)

const ListPage = ({ ListContainer }) => {
  return () => {
    const { params, updateParams, getParamsUpdater } = usePrefParams(defaultParams)
    const [data, loading, reload] = useDataLoader(virtualMachineActions.list, params)
    const updateClusterId = useCallback((clusterId) => {
      updateParams({
        clusterId,
        namespace: allKey,
      })
    }, [])
    return (
      <ListContainer
        loading={loading}
        reload={reload}
        data={data}
        getParamsUpdater={getParamsUpdater}
        filters={
          <>
            <ClusterPicklist
              // @ts-ignore
              selectFirst={false}
              onChange={updateClusterId}
              value={params.clusterId}
              onlyMasterNodeClusters
            />
            <NamespacePicklist
              // @ts-ignore
              selectFirst={false}
              onChange={getParamsUpdater('namespace')}
              value={params.namespace}
              clusterId={params.clusterId}
              disabled={!params.clusterId}
            />
          </>
        }
        {...pick(listTablePrefs, params)}
      />
    )
  }
}

const NetworkInterfaces = ({ interfaces = [] }) => {
  const classes = useStyles()
  return (
    <>
      {interfaces?.map((iface, idx) => (
        <div key={idx} className={classes.networkInterfaces}>
          <span>{iface?.interfaceName || iface?.name} - </span>
          <div>
            {iface?.ipAddresses?.map((addr) => (
              <div key={addr}>{addr}</div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
const renderVMDetailLink = (name, vm) => {
  const namespace = vm?.metadata?.namespace
  const clusterId = vm?.clusterId
  return (
    <SimpleLink src={routes.virtualMachines.detail.path({ clusterId, namespace, name })}>
      {name}
    </SimpleLink>
  )
}

const renderClusterLink = (name, { clusterId }) => {
  return <SimpleLink src={routes.cluster.nodes.path({ id: clusterId })}>{name}</SimpleLink>
}

// const renderStatus = (phase) => {
//   return (
//     <ClusterStatusSpan title={phase} variant="table" status={importedClusterStatusMap[phase]}>
//       {phase}
//     </ClusterStatusSpan>
//   )
// }

export const options = {
  addButtonConfigs: [
    {
      label: 'New Virtual Machine',
      link: routes.virtualMachines.add.new.path(),
    },
    {
      label: 'Import with URL',
      link: routes.virtualMachines.add.importURL.path(),
    },
    {
      label: 'Import with Disk',
      link: routes.virtualMachines.add.importDisk.path(),
    },
    {
      label: 'Clone from PVC',
      link: routes.virtualMachines.add.clonePVC.path(),
    },
  ],
  // deleteFn: podActions.delete,
  addText: 'Add Virtual Machine',
  columns: [
    { id: 'name', label: 'Name', render: renderVMDetailLink },
    {
      id: 'status.interfaces',
      label: 'Network Interfaces',
      render: (value) => <NetworkInterfaces interfaces={value} />,
    },
    { id: 'status.nodeName', label: 'Node IP' },
    { id: 'status.phase', label: 'Status' },
    {
      id: 'metadata.creationTimestamp',
      label: 'Age',
      render: (value) => <DateAndTime value={value} />,
    },
    {
      id: 'status.guestOSInfo.prettyName',
      label: 'Guest OS',
      render: (value) => value || 'Not Available',
    },
    { id: 'clusterName', label: 'Cluster', render: renderClusterLink },
    { id: 'metadata.namespace', label: 'Namespace' },
    { id: 'metadata.labels', label: 'Labels', render: renderLabels('label') },
  ],
  name: 'Virtual Machines',
  title: 'Virtual Machines',
  ListPage,
}
const components = createCRUDComponents(options)
export const VirtualMachinesList = components.List

export default components.ListPage

const useStyles = makeStyles<Theme>((theme) => ({
  networkInterfaces: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.25, 0, 0.25, 0.5),
  },
}))
