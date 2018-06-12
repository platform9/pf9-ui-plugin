import React, { Fragment } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { compose, withApollo } from 'react-apollo'
import requiresAuthentication from '../../util/requiresAuthentication'
import { createMuiTheme, MuiThemeProvider, withStyles } from '@material-ui/core/styles'
import { Button, Divider, Paper, Typography } from '@material-ui/core'
import ListTable from 'core/common/ListTable'

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 8
  },
  code: {
    fontSize: '90%',
    padding: theme.spacing.unit * 0.25,
    color: theme.palette.primary.main,
    background: theme.palette.grey[100],
    borderRadius: '3px'
  }
})

const textTheme = createMuiTheme({
  typography: {
    title: {
      lineHeight: 2
    },
    body1: {
      lineHeight: 2.5
    }
  },
  overrides: {
    MuiDivider: {
      root: {
        marginTop: '1em',
        marginBottom: '1em'
      }
    }
  }
})

// Fake data. Should fetch data from host
let id = 0
function createData (name, ip, path) {
  id++
  return { id, name, ip, path }
}

const columns = [
  { id: 'name', label: 'Host Name' },
  { id: 'ip', label: 'IP Address' },
  { id: 'path', label: 'Path to Image Library Watch Folder' }
]

const data = [
  createData('test.company.sys', '10.10.10.10', '/var/opt/company/imagelibrary/data'),
  createData('dev.company.sys', '11.11.11.11', '/var/opt/company/imagelibrary/data')
]

class AddGlanceImagePage extends React.Component {
  renderManualImport () {
    const { classes } = this.props
    return (
      <Fragment>
        <Typography>
          We support two ways to import images into your Glance Image Catalog:
        </Typography>
        <Typography variant="title"> Manual Import </Typography>
        <Typography>
          The easiest way to populate your Image Catalog is by copying images into the image library watch folder on the host assigned with the Image Library role.
          <br />
          The following host is currently assigned the Image Library role:
        </Typography>
        <ListTable title="Host List" columns={columns} data={data} />
        <br />
        <Typography>
          Please <span className={classes.code}>scp</span> the image(s) to this watch folder, and they will be automatically imported into your Glance Image Catalog.
          <br />
          <b>Important</b>: Remove colons <span className={classes.code}>:</span> from image file names. Images with names containing colons may be falsely reported.
          <br />
          If an image is <span className={classes.code}>raw</span>, and not in a format that is recognized by the <span className={classes.code}>qemu-img info</span> command, it must have one of the following extensions: .raw, .img, .dat, .bin.
          <br />
          If an image is <span className={classes.code}>raw</span>, and not in a format that is recognized by the <span className={classes.code}>qemu-img info</span> command, it must have one of the following extensions: .raw, .img, .dat, .bin.
          <br />
          <b>Image Permissions</b>: Your image files must have the right permissions - world-readable or readable to <span className={classes.code}>company</span> user and <span className={classes.code}>company-group</span> group.
          <br />
          You can use the following command on the image file: <span className={classes.code}>chown pf9:pf9group &lt;image-file-name&gt;</span>
        </Typography>
      </Fragment>
    )
  }

  renderGlancedClinet () {
    const { classes } = this.props
    return (
      <Fragment>
        <Typography variant="title">Using OpenStack Glance Client</Typography>
        <Typography>
          Use the OpenStack Glance Client to import images into Platform9.
          <br />
          Example:
        </Typography>
        <Typography className={classes.code}>
          &nbsp;&nbsp;glance image-create&nbsp;&nbsp;--disk-format qcow2
        </Typography>
        <Typography className={classes.code} style={{paddingLeft: '18ch'}}>
          --container-format bare \<br />
          --file ~/images/my-qcow2-img.img \<br />
          --visibility public \<br />
          --name myimage \<br />
          --property pf9_description='best image ever' \<br />
          --property virtual_size=41126400
        </Typography>
        <Typography>
          See the following support article for details: <a href="https://platform9.com/support/managing-images-with-the-openstack-glance-client/"> Managing Images with the OpenStack Glance Client</a>.
        </Typography>
      </Fragment>
    )
  }

  renderCreateNewImage () {
    return (
      <Fragment>
        <Typography variant="title">Creating a new image</Typography>
        <Typography>
          If you wish to create an image from scratch you may follow this guide:
          <br />
          <a href="https://docs.openstack.org/image-guide/create-images-manually.html">Create any Virtual Machine Image from Scratch</a>
        </Typography>
      </Fragment>
    )
  }

  render () {
    const { classes } = this.props
    return (
      <MuiThemeProvider theme={textTheme}>
        <Fragment>
          <Paper className={classes.root}>
            <Button
              variant="outlined"
              component={Link}
              to="/ui/openstack/glanceimages"
              style={{ marginBottom: '1em' }}
            >
              &lt;&lt;&nbsp;Back to list
            </Button>
            <Typography variant="display1" color="primary">Import a New Image</Typography>
            <Divider />
            {this.renderManualImport()}
            {this.renderGlancedClinet()}
            <Divider />
            {this.renderCreateNewImage()}
          </Paper>
        </Fragment>
      </MuiThemeProvider>
    )
  }
}

export default compose(
  requiresAuthentication,
  withRouter,
  withApollo,
  withStyles(styles)
)(AddGlanceImagePage)
