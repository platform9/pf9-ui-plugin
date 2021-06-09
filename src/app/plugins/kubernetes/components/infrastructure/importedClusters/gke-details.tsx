import React from 'react'
import InfoPanel, { getFieldsForCard, IDetailFields } from 'core/components/InfoPanel'
import { makeStyles } from '@material-ui/styles'
import { ImportedClusterSelector } from './model'
import Theme from 'core/themes/model'

const renderBoolean = (bool) => (bool ? 'True' : 'False')

const clusterOverviewFields: Array<IDetailFields<ImportedClusterSelector>> = [
  { id: 'spec.gke.initialClusterVersion', title: 'Initial Cluster Version' },
  { id: 'spec.gke.releaseChannel', title: 'Release Channel' },
  { id: 'spec.gke.databaseEncryption', title: 'Database Encryption' },
]

const networkingFields: Array<IDetailFields<ImportedClusterSelector>> = [
  { id: 'spec.gke.network.useIpAliases', title: 'Use IP Aliases', render: renderBoolean },
  { id: 'spec.gke.network.network', title: 'Network' },
  { id: 'spec.gke.network.subnetwork', title: 'Subnet' },
  { id: 'spec.gke.network.podIpv4CIDR', title: 'Pod CIDR' },
  { id: 'spec.gke.network.servicesIpv4CIDR', title: 'Services CIDR' },
  {
    id: 'spec.gke.network.networkPolicyConfig',
    title: 'Network Policy Config',
    render: renderBoolean,
  },
]

interface Props {
  cluster: ImportedClusterSelector
  loading: boolean
  reload: any
}
const GkeDetails = ({ cluster, loading, reload }: Props) => {
  const classes = useStyles({})
  const overview = getFieldsForCard(clusterOverviewFields, cluster)
  const networking = getFieldsForCard(networkingFields, cluster)

  return (
    <div className={classes.clusterInfo}>
      <InfoPanel className={classes.overview} title="Overview" items={overview} />
      <InfoPanel className={classes.networking} title="Networking" items={networking} />
    </div>
  )
}

export default GkeDetails

const useStyles = makeStyles<Theme>((theme) => ({
  clusterInfo: {
    display: 'grid',
    gridTemplateColumns: 'max-content max-content',
    gridTemplateRows: 'max-content max-content',
    gridGap: '16px',
    alignItems: 'stretch',
    justifyItems: 'start',
    marginTop: theme.spacing(2),
    maxWidth: 1100,
    gridTemplateAreas: `
    "overview overview networking"
    `,
  },
  overview: {
    gridArea: 'overview',
  },
  networking: {
    gridArea: 'networking',
  },
}))
