import React from 'react'
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { castBoolToStr } from 'utils/misc'
import CodeBlock from 'core/components/CodeBlock'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import { Divider } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  reviewTable: {
    borderSpacing: '8px',
  },
  rowLabel: {
    width: '300px',
  },
  rowValue: {
    fontWeight: '600',
  },
  divider: {
    margin: theme.spacing(1, 0, 1, 0),
  },
}))

const DataRow = ({ label, value, ...props }) => {
  const classes = useStyles()
  return (
    <tr>
      <td className={classes.rowLabel}>
        <Text variant="body2" component="span">
          {label}
        </Text>
      </td>
      <td>
        {value === 'Not Enabled' && (
          <Text variant="body2" className={classes.disabledText} component="span">
            {value}
          </Text>
        )}
        {value !== 'Not Enabled' && (
          <Text variant="body2" className={classes.rowValue} component="span">
            {value}
          </Text>
        )}
      </td>
    </tr>
  )
}

// TODO: azs, networking info, services/api FQDN auto-generate, MTU size
const AwsClusterReviewTable = ({ data }) => {
  const classes = useStyles()
  const numWorkers = data.enableCAS
    ? `Min ${data.numWorkers} - Max ${data.numMaxWorkers}`
    : data.numWorkers
  return (
    <>
      <table className={classes.reviewTable}>
        <tbody>
          <DataRow label="Name" value={data.name} />
          <DataRow label="Region" value={data.region} />
          <DataRow label="Operating system" value={data.ami} />
        </tbody>
      </table>
      <Divider className={classes.divider} />
      <table className={classes.reviewTable}>
        <tbody>
          <DataRow label="Master node instance type" value={data.masterFlavor} />
          <DataRow label="Worker node instance type" value={data.workerFlavor} />
          <DataRow label="Auto scaling" value={castBoolToStr()(data.enableCAS)} />
          <DataRow label="Num master nodes" value={data.numMasters} />
          <DataRow label="Num worker nodes" value={numWorkers} />
          <DataRow label="SSH key" value={data.sshKey} />
          <DataRow
            label="Enable workloads on all master nodes"
            value={castBoolToStr()(data.allowWorkloadsOnMaster)}
          />
        </tbody>
      </table>
      <Divider className={classes.divider} />
      <table className={classes.reviewTable}>
        <tbody>
          <DataRow label="API FQDN" value={data.externalDnsName} />
          <DataRow label="Containers CIDR" value={data.containersCidr} />
          <DataRow label="Services CIDR" value={data.servicesCidr} />
          <DataRow label="Network backend" value={data.networkPlugin} />
          <DataRow label="Privileged" value={castBoolToStr()(data.privileged)} />
          {/* <DataRow label="Application catalog" value={castBoolToStr()(data.appCatalogEnabled)} /> */}
          <DataRow
            label="Prometheus monitoring"
            value={castBoolToStr()(data.prometheusMonitoringEnabled)}
          />
          <DataRow
            label="Tags"
            value={<CodeBlock>{JSON.stringify(data.tags || [], null, 2)}</CodeBlock>}
          />
        </tbody>
      </table>
    </>
  )
}

export default AwsClusterReviewTable
