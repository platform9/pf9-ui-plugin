import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'ramda'
import Picklist from 'core/components/Picklist'
import CommonPanel from './CommonPanel'
import { Divider, Grid, Typography, TextField } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const actionTypes = ['API', 'alert']
const httpMethods = ['GET', 'POST', 'PUT', 'DELETE']

const styles = theme => ({
})

class ActivityPropertyPanel extends React.Component {
  handleChange = field => value => {
    this.props.onChange({ [field]: value })
  }

  handleChangeEventValue = field => e => {
    this.props.onChange({ [field]: e.target.value })
  }

  render () {
    const { node, nodeWalker } = this.props
    return (
      <div>
        <Typography variant="h5">Activity</Typography>
        <Divider />

        <CommonPanel node={node} nodeWalker={nodeWalker} />
        <Divider />

        <Typography variant="h6">Action</Typography>
        <Grid container alignItems="center">
          <Grid item xs={4}>label</Grid>
          <Grid item xs={8}>
            <TextField name="label" label="label" value={node.label || ''} onChange={this.handleChangeEventValue('label')} />
          </Grid>

          <Grid item xs={4}>action type</Grid>
          <Grid item xs={8}>
            <Picklist
              name="action"
              options={actionTypes}
              label="action to perform"
              value={node.action || ''}
              onChange={this.handleChange('action')}
            />
          </Grid>
        </Grid>
        <Divider />

        {node.action === 'API' &&
          <React.Fragment>
            <Typography variant="h6">API call</Typography>
            <Grid container alignItems="center">
              <Grid item xs={4}>URL</Grid>
              <Grid item xs={8}>
                <TextField name="url" label="url" value={node.url || ''} onChange={this.handleChangeEventValue('url')} />
              </Grid>
              <Grid item xs={4}>HTTP method</Grid>
              <Grid item xs={8}>
                <Picklist
                  name="httpMethod"
                  options={httpMethods}
                  label="HTTP method"
                  value={node.httpMethod || ''}
                  onChange={this.handleChange('httpMethod')}
                />
              </Grid>
            </Grid>
            <pre>{JSON.stringify(node, null, 4)}</pre>
          </React.Fragment>
        }
      </div>
    )
  }
}

ActivityPropertyPanel.propTypes = {
  onChange: PropTypes.func.isRequired,
  nodeWalker: PropTypes.object.isRequired,
}

export default compose(
  withStyles(styles),
)(ActivityPropertyPanel)
