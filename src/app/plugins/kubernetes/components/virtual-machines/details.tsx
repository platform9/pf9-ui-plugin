import { makeStyles } from '@material-ui/styles'
import EntityPage from 'core/components/entity-page'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import InfoPanel, { getFieldsForCard } from 'core/components/InfoPanel'
import Progress from 'core/components/progress/Progress'
import SimpleLink from 'core/components/SimpleLink'
import Text from 'core/elements/text'
import useDataLoader from 'core/hooks/useDataLoader'
import Theme from 'core/themes/model'
import { routes } from 'core/utils/routes'
import React from 'react'
import useReactRouter from 'use-react-router'
import { formatDate } from 'utils/misc'
import { virtualMachineDetailsLoader } from './actions'
import { batchActions } from './constants'

const overviewFields = [
  {
    id: 'metadata.creationTimestamp',
    title: 'Created On',
    required: true,
    render: (ts: string) => formatDate(ts),
  },
  {
    id: 'status.phase',
    title: 'Status',
    required: true,
  },
]
const specFields = [
  {
    id: 'spec.domain.resources.requests.cpu',
    title: 'CPU',
    required: true,
  },
  {
    id: 'spec.domain.resources.requests.memory',
    title: 'Memory',
    required: true,
  },
]
const getNetworkFieldsByIface = (iface) => ({
  Name: { value: iface?.interfaceName },
  'IP Address': { value: iface?.ipAddress },
  'MAC Address': { value: iface?.mac },
})
const getStorageFieldsByIface = (storage, volumes = []) => {
  if (storage.kind !== 'DataVolume') {
    return {}
  }
  const matchingVolume = volumes.find(
    (volume) => volume?.[volume.vmType]?.name === storage?.metadata?.name,
  )
  return {
    Name: { value: storage?.metadata?.name },
    'Backing Volume': {
      value: matchingVolume?.name,
    },
    'Disk Capacity': { value: storage?.spec?.pvc?.resources?.requests?.storage },
  }
}

const VirtualMachineDetailPage = () => {
  const classes = useStyles({})
  const { match } = useReactRouter()
  const { clusterId, namespace, name } = match?.params || {}
  // We dont really have select one capability as everything is assumed to be a list
  // so since the details loader only returns one item we need to destructure it
  const [[virtualMachine], loading] = useDataLoader(virtualMachineDetailsLoader, {
    clusterId,
    namespace,
    name,
  }) as any

  let networkFields = {}
  // eslint-disable-next-line no-unused-expressions
  virtualMachine?.status?.interfaces?.forEach((iface) => {
    networkFields = Object.assign(networkFields, getNetworkFieldsByIface(iface))
  })

  let storageFields = {}
  // eslint-disable-next-line no-unused-expressions
  virtualMachine?.volumeDetails?.forEach((volume) => {
    storageFields = Object.assign(
      storageFields,
      getStorageFieldsByIface(volume, virtualMachine?.spec?.volumes),
    )
  })

  return (
    <Progress loading={loading}>
      <EntityPage
        title={virtualMachine?.metadata?.name}
        entity={virtualMachine}
        backLink={
          <SimpleLink src={routes.virtualMachines.list.path()}>
            <Text variant="subtitle2">
              <FontAwesomeIcon>arrow-left</FontAwesomeIcon> Back to VM Instances
            </Text>
          </SimpleLink>
        }
        actions={batchActions}
      >
        <div className={classes.container}>
          <InfoPanel
            className={classes.card}
            title="Overview"
            items={getFieldsForCard(overviewFields, virtualMachine)}
          />
          <InfoPanel
            className={classes.card}
            title="Spec"
            items={getFieldsForCard(specFields, virtualMachine)}
          />
          <InfoPanel className={classes.card} title="Networks" items={networkFields} />
          <InfoPanel className={classes.card} title="Storage" items={storageFields} />
        </div>
      </EntityPage>
    </Progress>
  )
}

export default VirtualMachineDetailPage

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: 'max-content max-content',
    gridGap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  card: {
    width: 'auto',
  },
}))
