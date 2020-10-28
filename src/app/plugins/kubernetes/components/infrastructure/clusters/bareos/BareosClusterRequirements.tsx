import React, { FC, useCallback, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import BulletList from 'core/components/BulletList'
import SubmitButton from 'core/components/buttons/SubmitButton'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import ExternalLink from 'core/components/ExternalLink'
import { gettingStartedHelpLink } from 'k8s/links'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { routes } from 'core/utils/routes'
import Text from 'core/elements/text'
import { IconInfo } from 'core/components/validatedForm/Info'
import Theme from 'core/themes/model'
import { capitalizeString } from 'utils/misc'
import { ClusterCreateTypes } from '../model'
import { CloudProviders } from '../../cloudProviders/model'
import { loadNodes } from '../../nodes/actions'
import useDataLoader from 'core/hooks/useDataLoader'
import { allPass } from 'ramda'
import { isConnected, isUnassignedNode } from './ClusterHostChooser'
import InsufficientNodesNodesDialog from './InsufficientNodesDialog'

const requiredNodes = 2

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    borderRadius: 4,
    boxShadow:
      '0 2.5px 2.5px -1.5px rgba(0, 0, 0, 0.2), ' +
      '0 1.5px 7px 1px rgba(0, 0, 0, 0.12), ' +
      '0 4px 5px 0.5px rgba(0, 0, 0, 0.14)',
    padding: theme.spacing(3, 2),
    marginTop: theme.spacing(4),
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  requirements: {
    display: 'grid',
    alignItems: 'center',
    gridTemplateColumns: 'repeat(auto-fill, 200px)',
    margin: theme.spacing(2, 4, 1, 4),
  },
  text: {
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(3),
  },
  bulletList: {
    marginLeft: theme.spacing(7),
  },
  requirementsTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.text.primary}`,
    padding: theme.spacing(1, 1, 1.5, 1),
    marginBottom: theme.spacing(1),
  },
  blueIcon: {
    color: theme.palette.primary.main,
  },
  harwareSpecIcon: {
    fontSize: 16,
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
    border: `1px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.background.paper,
    marginRight: theme.spacing(2),
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  formCard: {
    color: theme.palette.grey[700],
  },
}))

const nodeServices = [
  'Prometheus',
  'Grafana',
  'Metal LB for Service Type Load Balancer (Optional)',
  'Multi-Master Virtual IP using VRRP (Optional)',
]

interface Props {
  onComplete: (route: string) => void
  provider: CloudProviders
}

const BareOSClusterRequirements: FC<Props> = ({ onComplete, provider }) => {
  const classes = useStyles({})
  const [showDialog, setShowDialog] = useState(false)
  const [clusterCreateType, setClusterCreateType] = useState('')
  const [availableNodes, setAvailableNodes] = useState(0)
  const [nodes, loading] = useDataLoader(loadNodes)

  useEffect(() => {
    if (!loading) {
      const numNodes = nodes.filter(allPass([isConnected, isUnassignedNode])).length
      setAvailableNodes(numNodes)
    }
  }, nodes)

  const handleClick = useCallback(
    (type: ClusterCreateTypes) => () => {
      const hasAvailableNodes = availableNodes >= requiredNodes
      if (!hasAvailableNodes) {
        setClusterCreateType(type)
        setShowDialog(true)
      } else {
        onComplete(routes.cluster.addBareOs[provider][type].path())
      }
    },
    [onComplete, provider, nodes],
  )

  return (
    <>
      {showDialog && (
        <InsufficientNodesNodesDialog
          clusterCreateType={clusterCreateType}
          availableNodes={availableNodes}
          requiredNodes={requiredNodes}
          showDialog={showDialog}
          setShowDialog={setShowDialog}
        />
      )}
      <FormFieldCard
        className={classes.formCard}
        title={`BareOS ${capitalizeString(provider)} Cluster`}
        link={
          <div>
            <ExternalLink textVariant="caption2" url={gettingStartedHelpLink}>
              BareOS Cluster Help
            </ExternalLink>
          </div>
        }
      >
        <Text className={classes.text} variant="body2">
          Create a BareOS cluster using Ubuntu or CentOS {provider} machines.
        </Text>
        <br />
        <Text variant="body2" className={classes.text}>
          Cluster comes built in with:
        </Text>
        <BulletList className={classes.bulletList} items={nodeServices} />
        <IconInfo icon="info-circle" title="Minimum Hardware Requirements:">
          <div className={classes.requirements}>
            <HardwareSpec title="2 VCPUs" icon="microchip" />
            <HardwareSpec title="5GB RAM" icon="memory" />
            <HardwareSpec title="20GB HDD" icon="hdd" />
          </div>
        </IconInfo>

        <div className={classes.actionRow}>
          <Text variant="caption1">For simple & quick cluster creation with default settings:</Text>
          <SubmitButton onClick={handleClick(ClusterCreateTypes.OneClick)}>
            One-Click Cluster
          </SubmitButton>
        </div>
        <div className={classes.actionRow}>
          <Text variant="caption1">For more customized cluster creation:</Text>
          <SubmitButton onClick={handleClick(ClusterCreateTypes.SingleMaster)}>
            Single Master Cluster
          </SubmitButton>
          <SubmitButton onClick={handleClick(ClusterCreateTypes.MultiMaster)}>
            Multi-Master Cluster
          </SubmitButton>
        </div>
      </FormFieldCard>
    </>
  )
}
export default BareOSClusterRequirements

const HardwareSpec = ({ title, icon }) => {
  const classes = useStyles({})
  return (
    <div className={classes.flex}>
      <span className={classes.harwareSpecIcon}>
        <FontAwesomeIcon className={classes.blueIcon}>{icon}</FontAwesomeIcon>
      </span>
      <Text variant="body2">{title}</Text>
    </div>
  )
}
