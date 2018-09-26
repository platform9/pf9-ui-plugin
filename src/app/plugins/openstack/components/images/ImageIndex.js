import React from 'react'
import { Grid, Paper, Tabs, Tab, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import ImageListPage from './ImageListPage'
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

class ImageIndex extends React.Component {
  state = {
    value: '/ui/openstack/images#images',
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
              <Tab value="/ui/openstack/images#images" label="Imported Images" href="#images" />
              <Tab value="/ui/openstack/images#builtimages" label="Download Prebuilt Images" href="#builtimages" />
            </Tabs>
            { value === '/ui/openstack/images#images' &&
              <TabContainer >
                <ImageListPage />
              </TabContainer>
            }
            { value === '/ui/openstack/images#builtimages' &&
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

export default withStyles(styles)(ImageIndex)
