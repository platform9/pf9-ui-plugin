import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Hidden from '@material-ui/core/Hidden'
import { Grid } from '@material-ui/core'
import ProgressCard from './ProgressCard'

const styles = theme => ({
  root: {
    flexGrow: 1,
  }
})

@withStyles(styles)
class ProgressCardList extends React.Component {
  render () {
    const { classes, cards } = this.props
    const cardNum = Math.round(12 / cards.length)
    return (
      <Hidden smDown>
        <Grid
          container
          justify="space-between"
          className={classes.root}
          spacing={32}
        >
          {cards.map(card => {
            return (
              <Grid item sm={cardNum} key={card.title}>
                <ProgressCard card={card} />
              </Grid>
            )
          })}
        </Grid>
      </Hidden>
    )
  }
}

export default ProgressCardList
