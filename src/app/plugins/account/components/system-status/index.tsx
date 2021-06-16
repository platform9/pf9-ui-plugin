// Libs
import React from 'react'
import { useSelector } from 'react-redux'
import { prop } from 'ramda'
import { makeStyles } from '@material-ui/core'

// Types
import Theme from 'core/themes/model'
import { RootState } from 'app/store'
import { ClientState, clientStoreKey } from 'core/client/clientReducers'

// Components
import ServiceCard from './service-card'
import Summary from './summary'

export default function AccountStatus() {
  const classes = useStyles()
  const { systemStatus } = useSelector<RootState, ClientState>(prop(clientStoreKey))
  const elems = Object.entries(systemStatus?.serviceDetails).map(([name, details]) => (
    <ServiceCard name={name} details={details} taskState={systemStatus?.taskState} />
  ))
  return (
    <section className={classes.page}>
      <Summary
        taskState={systemStatus?.taskState}
        desiredServices={systemStatus?.desiredServices}
        readyServices={systemStatus?.readyServices}
        serviceDetails={systemStatus?.serviceDetails}
      />
      <div className={classes.cards}>{elems}</div>
    </section>
  )
}

const useStyles = makeStyles<Theme>((theme: Theme) => ({
  page: {
    position: 'fixed',
    zIndex: 10000,
    top: 55,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'auto',
    display: 'grid',
    gridTemplateRows: '200px 1fr',
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.grey[900],
    gridGap: '40px',
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(100px, 300px))',
    gridGap: '16px',
    justifyContent: 'center',
    alignContent: 'flex-start',
    padding: '0 16px 40px 16px',
    [theme.breakpoints.down(1600)]: {
      gridTemplateColumns: 'repeat(4, minmax(100px, 300px))',
    },
    [theme.breakpoints.down(1280)]: {
      gridTemplateColumns: 'repeat(3, minmax(100px, 300px))',
    },
    [theme.breakpoints.down(975)]: {
      gridTemplateColumns: 'repeat(2, minmax(100px, 300px))',
    },
  },
}))
