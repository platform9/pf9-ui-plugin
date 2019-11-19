// Libs
import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { Typography, Theme, Card, CardHeader, CardContent } from '@material-ui/core'
import useReactRouter from 'use-react-router'

// Actions
import useDataLoader from 'core/hooks/useDataLoader'
import { loadNodes } from './actions'

// Components
import PageContainer from 'core/components/pageContainer/PageContainer'

// Models
import { ICombinedNode } from './model'
import SimpleLink from 'core/components/SimpleLink'
import Progress from 'core/components/progress/Progress'

// Styles
const useStyles = makeStyles((theme: Theme) => ({
  backLink: {
    marginBottom: theme.spacing(2),
  },
  flex: {
    display: 'flex',
  },
  rowHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  rowValue: {
    marginLeft: theme.spacing(0.5)
  },
  card: {
    marginRight: theme.spacing(2),
  },
}))

const AnyLink: any = SimpleLink

const ClusterDetailsPage = () => {
  const { match } = useReactRouter()
  const classes = useStyles({})
  const [nodes, loading] = useDataLoader(loadNodes)
  const selectedNode: ICombinedNode = nodes.find(
    (x: ICombinedNode) => x.uuid === match.params.id
  ) || {}
  return (
    <PageContainer
      header={
        <>
          <Typography variant="h3">Node {selectedNode.name}</Typography>
          <AnyLink src={`/ui/kubernetes/infrastructure#nodes`} className={classes.backLink}>
            <span>« Back to Node List</span>
          </AnyLink>
        </>
      }
    >
    { loading
      ? <Progress message="Loading Nodes..." />
      : <NodeDetail {...selectedNode} />
    }
    </PageContainer>
  )
}

const NodeDetail = ({ uuid, name, combined, ...rest }: ICombinedNode) => {
  const { flex, card } = useStyles({})
  const hostId = uuid
  const roles = combined?.roles
  const hostname = name
  const os = combined?.osInfo
  const hypervisorType = combined?.resmgr?.hypervisor_info?.hypervisor_type

  return (
    <div className={flex}>
      <Card className={card}>
        <CardHeader title="Misc" />
        <CardContent>
          <table>
            <tbody>
              <DetailRow label="Host ID" value={hostId} />
              <DetailRow label="Roles" value={roles} />
              <DetailRow label="Hypervisor Type" value={hypervisorType} />
              <DetailRow label="Operating System" value={os} />
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader title="Network Interfaces" />
        <CardContent>
          <table>
            <tbody>
              <DetailRow label="Hostname" value={hostname} />
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

const DetailRow = ({ label, value }) => {
  const { rowHeader, rowValue } = useStyles({})
  return (
    <tr>
      <td>
        <Typography className={rowHeader} variant="subtitle2">{label}:</Typography>
      </td>
      <td>
        <Typography className={rowValue}>{value}</Typography>
      </td>
    </tr>
  )
}

export default ClusterDetailsPage
