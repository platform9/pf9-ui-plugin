import React from 'react'
import { makeStyles } from '@material-ui/styles'
import useReactRouter from 'use-react-router'
import { capitalizeString } from 'utils/misc'
import Text from 'core/elements/text'
import BulletList from 'core/components/BulletList'
import Theme from 'core/themes/model'
import Qbert from 'api-client/Qbert'
import Appbert from 'api-client/Appbert'
import Cinder from 'api-client/Cinder'
import Clemency from 'api-client/Clemency'
import Glance from 'api-client/Glance'
import Keystone from 'api-client/Keystone'
import Murano from 'api-client/Murano'
import Neutron from 'api-client/Neutron'
import Nova from 'api-client/Nova'
import ResMgr from 'api-client/ResMgr'
import ApiRequestHelper from './ApiRequestHelper'

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexFlow: 'row nowrap',
  },
  grid: {
    display: 'grid',
    flexGrow: 0,
    gridTemplateColumns: 'repeat(3, 400px)',
    gridGap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  card: {
    display: 'grid',
    minWidth: '350px',
    minHeight: '135px',
    border: `solid 1px ${theme.palette.grey[300]}`,
    borderRadius: 4,
    padding: theme.spacing(1, 1, 0, 1),
    backgroundColor: theme.palette.grey['000'],
    overflowX: 'hidden',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  cardContent: {
    margin: theme.spacing(2),
  },
  contentText: {
    marginLeft: theme.spacing(2),
  },
  list: {
    marginLeft: theme.spacing(4),
  },
  apiRequestHelper: {
    flexGrow: 1,
    margin: theme.spacing(2),
  },
  header: {
    color: '#FFF',
  },
}))

const EndpointCard = ({ metadata, onClick }) => {
  const classes = useStyles()
  const params = metadata.params.length > 0 ? metadata.params : ['None']
  return (
    <div className={classes.card} onClick={onClick}>
      <div className={classes.cardContent}>
        <Text variant="h5">{metadata.name}</Text>
        <Text variant="h6" className={classes.contentText}>
          Parameters
        </Text>
        <BulletList className={classes.list} items={params} />
      </div>
    </div>
  )
}

const apiServices = {
  appbert: Appbert,
  cinder: Cinder,
  clemency: Clemency,
  glance: Glance,
  keystone: Keystone,
  murano: Murano,
  neutron: Neutron,
  nova: Nova,
  qbert: Qbert,
  resmgr: ResMgr,
}

const ApiDetailsPage = () => {
  const [activeCardMetadata, setMetadata] = React.useState(null)
  const classes = useStyles()
  const { match } = useReactRouter()
  const name = match.params['api_name']
  const methodsMetadata = apiServices[name].apiMethodsMetadata

  const activateCard = (metadata) => () => {
    setMetadata(metadata)
  }

  return (
    <div>
      <Text variant="h1">{capitalizeString(name)}</Text>
      <div className={classes.root}>
        <div className={classes.grid}>
          {methodsMetadata.map((metadata) => (
            <EndpointCard metadata={metadata} onClick={activateCard(metadata)} />
          ))}
        </div>
        {activeCardMetadata && (
          <ApiRequestHelper
            className={classes.apiRequestHelper}
            api={name}
            metadata={activeCardMetadata}
          />
        )}
      </div>
    </div>
  )
}

export default ApiDetailsPage
