import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'ramda'
import Picklist from 'core/components/Picklist'
import CommonPanel from './CommonPanel'
import { Divider, Grid, List, ListItem, ListItemText, Typography, TextField } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const actionTypes = ['API', 'alert', 'path', 'projectAs']
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

        <CommonPanel node={node} nodeWalker={nodeWalker} />
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
          </React.Fragment>
        }

        {node.action === 'path' &&
          <React.Fragment>
            <Typography variant="h6">path</Typography>
            <p>Specify the path (lens) selection as a string separated with '.'</p>
            <Grid container alignItems="center">
              <Grid item xs={4}>path</Grid>
              <Grid item xs={8}>
                <TextField name="path" label="path" value={node.path || ''} onChange={this.handleChangeEventValue('path')} />
                <br />
                <p>Or... just click the keys you want to use</p>
                {(() => {
                  const result = nodeWalker.executeAll(nodeWalker.startNode, node)
                  try {
                    const keys = Object.keys(result.output)
                    const selectPathKey = key => {
                      if (key === '..') {
                        const parts = node.path.split('.')
                        const newParts = parts.slice(0, -1)
                        return this.handleChange('path')(newParts.join('.'))
                      }
                      const prefix = node.path.length > 0 ? `${node.path}.` : ''
                      this.handleChange('path')(prefix + key)
                    }
                    return (
                      <List component="nav">
                        {['..', ...keys].map(key =>
                          <ListItem key={key} button dense onClick={() => selectPathKey(key)}>
                            <ListItemText><Typography variant="h5">{key}</Typography></ListItemText>
                          </ListItem>
                        )}
                      </List>
                    )
                  } catch (err) {}
                })()}
              </Grid>
              <Grid item xs={4}>default value</Grid>
              <Grid item xs={8}>
                <TextField name="pathDefault" label="pathDefault" value={node.pathDefault || ''} onChange={this.handleChangeEventValue('pathDefault')} />
              </Grid>
            </Grid>
          </React.Fragment>
        }

        {node.action === 'projectAs' &&
          <React.Fragment>
            <Typography variant="h6">projectAs</Typography>
            <p>Specify new object structure as `{'{'} "destKey": "sourceKey", ... }`</p>
            <p>Note: This must be valid JSON (double quotes required).</p>
            <Grid container alignItems="center">
              <Grid item xs={4}>mappings</Grid>
              <Grid item xs={8}>
                <TextField name="mappings" label="mappings" value={node.mappings || ''} onChange={this.handleChangeEventValue('mappings')} />
              </Grid>
            </Grid>
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
