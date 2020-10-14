import React from 'react'
import { makeStyles } from '@material-ui/styles'
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
import SearchBar from 'core/components/SearchBar'
import { Toolbar } from '@material-ui/core'
import PicklistDefault from 'core/components/Picklist'
const Picklist: any = PicklistDefault // types on forward ref .js file dont work well.

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
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
    // '& .MuiOutlinedInput-root': {
    //   marginBottom: theme.spacing(1),
    //   marginRight: theme.spacing(2),
    //   height: 40,
    // },
    // '& .Mui-focused.MuiOutlinedInput-root fieldset': {
    //   borderColor: theme.palette.grey[700],
    // },
    // '& .MuiFormLabel-root.Mui-focused': {
    //   color: theme.palette.grey[700],
    // },
  },
  search: {
    paddingLeft: theme.spacing(2),
    maxWidth: 240,
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
    // minWidth: '350px',
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

const requestVerbs = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']

const ApiDetailsPage = ({ service }) => {
  const [activeCardMetadata, setMetadata] = React.useState(null)
  const [requestSearch, setRequestSearch] = React.useState('')
  const [verbFilter, setVerbFilter] = React.useState('')
  const classes = useStyles()
  const methods = apiServices[service].apiMethodsMetadata

  const activateCard = (metadata) => () => {
    setMetadata(metadata)
  }

  console.log(verbFilter)

  const filteredMethods = () => {
    if (requestSearch !== '') {
      return methods.filter(
        (method) => method['name'].match(new RegExp(requestSearch, 'i')) !== null,
      )
    } else if (verbFilter !== '' && verbFilter !== 'ALL') {
      return methods.filter((method) => method['type'] === verbFilter)
    } else {
      return methods
    }
  }

  return (
    <div className={classes.root}>
      <div className={classes.methods}>
        <Toolbar className={classes.toolbar}>
          <div className={classes.controls}>
            <Picklist name="Verb" label="Verb" options={requestVerbs} onChange={setVerbFilter} />
            <SearchBar
              className={classes.search}
              searchTerm={requestSearch}
              onSearchChange={setRequestSearch}
            />
          </div>
        </Toolbar>
        <div className={classes.grid}>
          {filteredMethods().map((metadata) => (
            <EndpointCard metadata={metadata} onClick={activateCard(metadata)} />
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
