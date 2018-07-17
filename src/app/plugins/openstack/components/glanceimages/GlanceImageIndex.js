import React from 'react'
import { Grid, Paper, Tabs, Tab, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import GlanceImageListPage from './GlanceImageListPage'
import ImageCardListPage from './ImageCardListPage'

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    boxShadow: '0 0 0 0',
    backgroundColor: theme.palette.background.default
  }
})

function TabContainer ({ children, dir }) {
  return (
    <Typography component="div" dir={dir} >
      {children}
    </Typography>
  )
}

class GlanceImageIndex extends React.Component {
  state = {
    value: '/ui/openstack/glanceimages#images',
  }

  handleChange = (event, value) => {
    this.setState({ value })
  }

  render () {
    const { classes } = this.props
    const { value } = this.state
    return (
      <Grid container justify="center">
        <Grid item xs={12} zeroMinWidth>
          <Paper className={classes.root}>
            <Tabs
              value={value}
              onChange={this.handleChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab value="/ui/openstack/glanceimages#images" label="Imported Images" href="#images" />
              <Tab value="/ui/openstack/glanceimages#builtimages" label="Download Prebuilt Images" href="#builtimages" />
            </Tabs>
            { value === '/ui/openstack/glanceimages#images' &&
              <TabContainer >
                <GlanceImageListPage />
              </TabContainer>
            }
            { value === '/ui/openstack/glanceimages#builtimages' &&
              <TabContainer>
                <ImageCardListPage onChange={this.handleChange} />
              </TabContainer>
            }
          </Paper>
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(styles)(GlanceImageIndex)
