import React from 'react'
import {
  TextField, Card, Grid, CardMedia, Button, CardContent, Typography, Tooltip,
} from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { action } from '@storybook/addon-actions'
import GetAppIcon from '@material-ui/icons/GetApp'
import faker from 'faker'
import moment from 'moment'
import { pluck, propOr, range } from 'ramda'
import { isNumeric } from 'utils/misc'
import { addStoriesFromModule, randomInt } from '../helpers'
import CardTable from 'core/components/cardTable/CardTable'
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore'

const addStories = addStoriesFromModule(module)

const onMainActionClick = action('main action click')
const onDetailClick = action('detail click')
const onDownloadClick = action('download click')

const actions = { onMainActionClick, onDetailClick, onDownloadClick }
const styles = theme => ({
  card: {
    display: 'flex'
    // margin: theme.spacing(1),
    // padding: 0
  },
  text: {
    display: 'inline-block',
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(0.5)
  },
  rightText: {
    display: 'inline-block'
  },
  header: {
    textAlign: 'center',
    width: 120,
    padding: theme.spacing(2),
    borderRight: '1px solid #d2d2d2'
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1
  },
  icon: {
    width: '100%',
    minHeight: 120,
    backgroundSize: 'contain',
    backgroundPosition: `50% ${theme.spacing(1)}px`,
    marginBottom: theme.spacing(1)
  },
  buttonIcon: {
    marginRight: theme.spacing(1)
  },
  divider: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  info: {
    overflow: 'hidden',
    position: 'relative',
    /* use this value to count block height */
    lineHeight: '1.5em',
    /* max-height = line-height (1.2) * lines max number (3) */
    maxHeight: '4.5em',
    textAligh: 'justify',
    marginRight: '-1em',
    paddingRight: '1em',
    '&:before': {
      content: '\'...\'',
      position: 'absolute',
      right: theme.spacing(1),
      bottom: 0
    },
    '&:after': {
      content: '\'\'',
      position: 'absolute',
      right: 0,
      width: '2em',
      height: '1em',
      marginTop: '0.2em',
      background: 'white'
    }
  },
  content: {
    flex: '1 0 auto'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: theme.spacing(1)
  }
})

@withStyles(styles)
class CardTableContainer extends React.Component {
  state = {
    data: range(1, randomInt(20, 30)).map(id => ({
      id,
      uuid: faker.random.uuid(),
      name: faker.name.findName(),
      phone: faker.phone.phoneNumber(),
      email: faker.internet.email(),
      date: faker.date.past(),
      storage: faker.finance.amount(),
      description: faker.lorem.sentence(),
      active: faker.random.boolean()
    }))
  }

  handleEmailChange = email => {
    this.setState({
      filteredData: this.state.data.filter(item => item.email === email)
    })
  }

  sortingConfig = [
    {
      field: 'date',
      label: 'Date',
      sortWith: (prevDate, nextDate) =>
        moment(prevDate).isBefore(nextDate) ? 1 : -1
    },
    {
      field: 'storage',
      label: 'Storage',
      sortWith: (prevValue, nextValue) => (+prevValue > +nextValue ? 1 : -1)
    }
  ]

  get filtersConfig () {
    return [
      {
        field: 'email',
        type: 'select',
        onChange: this.handleEmailChange, // We do the filtering ourselves
        items: pluck('email', this.state.data)
      },
      {
        field: 'name',
        type: 'multiselect',
        label: 'Names', // Override column label
        items: pluck('name', this.state.data)
      },
      {
        field: 'storage',
        type: 'custom',
        filterWith: ({ min, max }, storage) =>
          (!isNumeric(min) || +storage >= +min) &&
          (!isNumeric(max) || +storage <= +max),
        // Custom filter control
        render: ({ value, onChange }) => (
          <div>
            <TextField
              label="Min storage"
              type="number"
              InputLabelProps={{ shrink: true }}
              value={propOr('', 'min', value)}
              onChange={e => onChange({ ...value, min: e.target.value })}
            />
            <TextField
              label="Min storage"
              type="number"
              InputLabelProps={{ shrink: true }}
              value={propOr('', 'max', value)}
              onChange={e => onChange({ ...value, max: e.target.value })}
            />
          </div>
        )
      },
      {
        field: 'active',
        type: 'checkbox'
      }
    ]
  }

  render () {
    const {
      props: { classes },
      filtersConfig,
      sortingConfig,
      state: { data, filteredData = data }
    } = this
    return this.props.children({
      filtersConfig,
      sortingConfig,
      data: filteredData,
      classes
    })
  }
}

const DefaultListTable = ({ actions }) => (
  <CardTableContainer>
    {({ filtersConfig, sortingConfig, data, classes }) => (
      <CardTable
        filters={filtersConfig}
        sorting={sortingConfig}
        data={data}
        searchTarget="name"
      >
        {item => (
          <Grid item sm={6} md={4} lg={4}>
            <Card className={classes.card}>
              <div className={classes.header}>
                <CardMedia
                  className={classes.icon}
                  image={item.icon}
                  title="icon"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={actions.onMainActionClick}
                >
                  Action
                </Button>
              </div>
              <div className={classes.details}>
                <CardContent className={classes.content}>
                  <Typography component="h6" variant="h6">
                    {item.name}
                  </Typography>
                  <Typography variant="body1" className={classes.text}>
                    {item.description}
                  </Typography>
                </CardContent>
                <div className={classes.actions}>
                  <Button onClick={actions.onDetailClick}>
                    <Tooltip title="More details about this application">
                      <UnfoldMoreIcon />
                    </Tooltip>
                  </Button>
                  <Button onClick={actions.onDownloadClick}>
                    <Tooltip title="Download the .tgz file for this application">
                      <GetAppIcon />
                    </Tooltip>
                  </Button>
                </div>
              </div>
            </Card>
          </Grid>
        )}
      </CardTable>
    )}
  </CardTableContainer>
)

addStories('Common Components/CardTable', {
  Default: () => <DefaultListTable actions={actions} />
})
