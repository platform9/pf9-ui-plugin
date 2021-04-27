// Libs
import React, { useMemo, FC } from 'react'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import useReactRouter from 'use-react-router'
// Actions
import useDataLoader from 'core/hooks/useDataLoader'
import { loadNodes } from './actions'
// Components
import PageContainer from 'core/components/pageContainer/PageContainer'
// Models
import { INodesSelector } from './model'
import SimpleLink from 'core/components/SimpleLink'
import Progress from 'core/components/progress/Progress'
import UsageWidget from 'core/components/widgets/UsageWidget'
import calcUsageTotalByPath from 'k8s/util/calcUsageTotals'
import HelpContainer from 'core/components/HelpContainer'
import { routes } from 'core/utils/routes'
import Theme from 'core/themes/model'
import NodeInfo from './NodeInfo'
import { HeaderCard } from '../clusters/ClusterDetailsPage'
import ClusterStatusSpan from '../clusters/ClusterStatus'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { variantIcon } from 'core/components/Alert'
import CodeBlock from 'core/components/CodeBlock'
import CopyToClipboard from 'core/components/CopyToClipboard'
import { hexToRGBA } from 'core/utils/colorHelpers'

// Styles
const useStyles = makeStyles((theme: Theme) => ({
  pageContainer: {
    position: 'relative',
    maxWidth: 1234,
  },
  backLink: {
    position: 'absolute',
    right: 0,
    top: 8,
    zIndex: 100,
    ...theme.typography.caption2,
  },
  nodeInfoContainer: {
    marginTop: theme.spacing(2),
  },
  detailsHeader: {
    display: 'grid',
    gridTemplateColumns: '434px repeat(3, 250px)',
    gridGap: theme.spacing(2),
    paddingBottom: 20,
  },
  rowHelp: {
    width: 24,
  },
  rowHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
    color: theme.palette.grey[700],
    textAlign: 'right',
  },
  rowValue: {
    marginLeft: theme.spacing(0.5),
    color: theme.palette.grey[700],
    wordBreak: 'break-all',
    display: 'flex',
    flexDirection: 'column',
  },
  clockSkewErrorMessage: {
    maxHeight: 165,
    fontSize: 14,
    padding: theme.spacing(0, 2),
    margin: 0,
    marginTop: theme.spacing(2),
    backgroundColor: 'transparent',
    color: theme.palette.red[500],
    fontWeight: 300,
    lineHeight: '15px',
  },
  clockSkewErrorAlert: {
    maxHeight: 224,
    maxWidth: 'inherit',
    padding: theme.spacing(0, 2, 2, 2),
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.red[500]}`,
    backgroundColor: hexToRGBA(theme.palette.red[500], 0.1),
    borderRadius: 4,

    '& > header': {
      color: theme.palette.red[500],
      borderBottom: `1px solid ${theme.palette.red[500]}`,
      display: 'grid',
      gridGap: theme.spacing(),
      gridTemplateColumns: '22px 1fr 22px',
      fontSize: 14,
      height: 40,
      alignItems: 'center',
    },
  },
}))

const ClusterDetailsPage: FC = () => {
  const { match } = useReactRouter()
  const classes = useStyles({})
  const [nodes, loading] = useDataLoader(loadNodes)
  const selectedNode: INodesSelector =
    nodes.find((x: INodesSelector) => x.uuid === match.params.id) || {}
  const message = selectedNode?.message as any

  return (
    <PageContainer
      className={classes.pageContainer}
      header={
        <SimpleLink src={routes.nodes.list.path()} className={classes.backLink}>
          « Back to Node List
        </SimpleLink>
      }
    >
      <Progress loading={loading} message="Loading Nodes..." minHeight={200}>
        <div className={classes.nodeInfoContainer}>
          <NodeStatusAndUsage node={selectedNode} loading={loading} />
          {message?.warn && <NodeClockSkewError errorMessage={message?.warn[0]} />}
          <NodeInfo />
        </div>
      </Progress>
    </PageContainer>
  )
}

const NodeClockSkewError = ({ errorMessage }) => {
  const classes = useStyles()
  return (
    <div className={classes.clockSkewErrorAlert}>
      <header>
        <FontAwesomeIcon>{variantIcon.error}</FontAwesomeIcon>
        <Text variant="caption1">Clock Skew Detected</Text>
        <CopyToClipboard copyText={errorMessage} copyIcon="copy" codeBlock={false} />
      </header>
      <CodeBlock className={classes.clockSkewErrorMessage}>{errorMessage}</CodeBlock>
    </div>
  )
}

export const DetailRow: FC<{
  label: string
  value: string | React.ReactNode
  helpMessage?: string
}> = ({ label, value, helpMessage }) => {
  const { rowHeader, rowValue, rowHelp } = useStyles({})
  return (
    <tr>
      <td>
        <Text className={rowHeader} variant="caption1" component="span">
          {label}:
        </Text>
      </td>
      <td>
        <Text
          className={rowValue}
          variant="body2"
          component={typeof value === 'string' ? 'span' : 'div'}
        >
          {value}
        </Text>
      </td>
      <td className={rowHelp}>
        {!!helpMessage && <HelpContainer title={helpMessage} color="black" />}
      </td>
    </tr>
  )
}

const NodeStatusAndUsage = ({ node, loading }) => {
  const classes = useStyles()
  const usage = useMemo(
    () => ({
      compute: calcUsageTotalByPath(
        [node],
        'combined.usage.compute.current',
        'combined.usage.compute.max',
      ),
      memory: calcUsageTotalByPath(
        [node],
        'combined.usage.memory.current',
        'combined.usage.memory.max',
      ),
      disk: calcUsageTotalByPath([node], 'combined.usage.disk.current', 'combined.usage.disk.max'),
    }),
    [node],
  )
  return (
    <div className={classes.detailsHeader}>
      <NodeStatus node={node} />
      <UsageWidget title="Compute" stats={usage.compute} units="GHz" />

      <UsageWidget title="Memory" stats={usage.memory} units="GiB" />

      <UsageWidget title="Storage" stats={usage.disk} units="GiB" />
    </div>
  )
}

const NodeStatus = ({ node }) => {
  const { name, message } = node
  return (
    <HeaderCard title={name} icon="cube" subtitle="" className="">
      <ClusterStatusSpan
        title="Clock Skew"
        status={message?.warn ? 'error' : 'ok'}
        variant="header"
        iconStatus
      >
        {message?.warn ? 'Clock Skew Detected' : 'No Clock Skew Detected'}
      </ClusterStatusSpan>
    </HeaderCard>
  )
}

export default ClusterDetailsPage
