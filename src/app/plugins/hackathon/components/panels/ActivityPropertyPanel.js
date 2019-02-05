import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'ramda'
import Picklist from 'core/components/Picklist'
import CommonPanel from './CommonPanel'
import PanelRow from './PanelRow'
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
          <PanelRow title="label">
            <TextField name="label" label="label" value={node.label || ''} onChange={this.handleChangeEventValue('label')} />
          </PanelRow>

          <PanelRow title="action type">
            <Picklist
              name="action"
              options={actionTypes}
              label="action to perform"
              value={node.action || ''}
              onChange={this.handleChange('action')}
            />
          </PanelRow>
        </Grid>
        <Divider />

        <CommonPanel node={node} nodeWalker={nodeWalker} />
        <Divider />

        {node.action === 'API' &&
          <React.Fragment>
            <Typography variant="h6">API call</Typography>
            <Grid container alignItems="center">
              <PanelRow title="url">
                <TextField name="url" label="url" value={node.url || ''} onChange={this.handleChangeEventValue('url')} />
              </PanelRow>
              <PanelRow title="HTTP method">
                <Picklist
                  name="httpMethod"
                  options={httpMethods}
                  label="HTTP method"
                  value={node.httpMethod || ''}
                  onChange={this.handleChange('httpMethod')}
                />
              </PanelRow>
            </Grid>
          </React.Fragment>
        }

        {node.action === 'path' &&
          <React.Fragment>
            <Typography variant="h6">path</Typography>
            <p>Specify the path (lens) selection as a string separated with '.'</p>
            <Grid container alignItems="center">
              <PanelRow title="path">
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
                      const prefix = (node.path || '').length > 0 ? `${node.path}.` : ''
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
              </PanelRow>
              <PanelRow title="default value">
                <TextField name="pathDefault" label="pathDefault" value={node.pathDefault || ''} onChange={this.handleChangeEventValue('pathDefault')} />
              </PanelRow>
            </Grid>
          </React.Fragment>
        }

        {node.action === 'projectAs' &&
          <React.Fragment>
            <Typography variant="h6">projectAs</Typography>
            <p>Specify new object structure as `{'{'} "destKey": "sourceKey", ... }`</p>
            <p>Note: This must be valid JSON (double quotes required).</p>
            <Grid container alignItems="center">
              <PanelRow title="mappings">
                <TextField name="mappings" label="mappings" value={node.mappings || ''} onChange={this.handleChangeEventValue('mappings')} />
              </PanelRow>
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
