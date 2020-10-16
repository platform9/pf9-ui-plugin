import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Text from 'core/elements/text'
import BulletList from 'core/components/BulletList'
import Theme from 'core/themes/model'
import Qbert from 'api-client/Qbert'
import Appbert from 'api-client/Appbert'
import Keystone from 'api-client/Keystone'
import ResMgr from 'api-client/ResMgr'
import ApiRequestHelper from './ApiRequestHelper'
import Filter from 'core/components/Filter'

const useStyles = makeStyles<Theme>((theme) => ({
  apiDetailsPage: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexFlow: 'row nowrap',
  },
  methods: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexFlow: 'column nowrap',
  },
  apiRequestHelper: {
    flexGrow: 1,
    margin: theme.spacing(2),
  },
  toolbar: {
    padding: theme.spacing(0, 2, 0, 1),
    color: theme.palette.grey[700],
    backgroundColor: theme.palette.grey[100],
    minHeight: 56,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 0,
  },
  controls: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    justifyContent: 'right',
  },
  grid: {
    display: 'grid',
    flexGrow: 0,
    gridTemplateColumns: 'repeat(3, 350px)',
    gridGap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  card: {
    display: 'grid',
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
        <Text variant="h6">{metadata.name}</Text>
        <Text variant="body1" className={classes.contentText}>
          Parameters
        </Text>
        <BulletList className={classes.list} items={params} />
      </div>
    </div>
  )
}

const apiServices = {
  appbert: Appbert,
  keystone: Keystone,
  qbert: Qbert,
  resmgr: ResMgr,
}

const ApiDetailsPage = ({ service }) => {
  const [activeCardMetadata, setMetadata] = React.useState(null)
  const [filteredMethods, setFilteredMethods] = React.useState([])
  const classes = useStyles()
  const methods = apiServices[service].apiMethodsMetadata

  const filters: Filter[] = [
    {
      name: 'Verb',
      label: 'Verb',
      options: ['GET', 'PATCH', 'PUT', 'POST', 'DELETE'],
      target: 'type',
    },
  ]

  const activateCard = (metadata) => () => {
    setMetadata(metadata)
  }

  return (
    <div className={classes.apiDetailsPage}>
      <div className={classes.methods}>
        <Filter
          data={methods}
          setFilteredData={setFilteredMethods}
          filters={filters}
          searchTarget="name"
        />
        <div className={classes.grid}>
          {filteredMethods.map((metadata) => (
            <EndpointCard
              key={metadata.name + metadata.url}
              metadata={metadata}
              onClick={activateCard(metadata)}
            />
          ))}
        </div>
      </div>

      {activeCardMetadata && (
        <ApiRequestHelper
          className={classes.apiRequestHelper}
          api={service}
          metadata={activeCardMetadata}
        />
      )}
    </div>
  )
}

export default ApiDetailsPage
