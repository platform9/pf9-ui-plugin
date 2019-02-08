import { TextField, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { compose } from 'ramda'
import React from 'react'

const styles = theme => ({
  root: {
    display: 'flex',
    flexFlow: 'column nowrap',
    textAlign: 'right'
  }
})

class FormPropsInspector extends React.Component {
  setPropValue = key => e => {
    this.props.onPropValueChange(key, e.target.value)
  }

  renderPropEdit = ([key, propType]) => {
    const value = this.props.propValues[key]
    switch (propType) {
      case PropTypes.string:
        return (
          <div key={key}>
            <TextField
              label={key}
              onChange={this.setPropValue(key)}
              value={value === undefined ? '' : value}
            />
          </div>
        )
      default:
        return <div key={key} />
    }
  }

  render () {
    const { classes, inputProps } = this.props
    return (
      <div className={classes.root}>
        {!inputProps ? (
          <Typography variant="h6">No input selected</Typography>
        ) : (
          <React.Fragment>
            <Typography variant="h6">Input props</Typography>
            <hr />
            {Object.entries(inputProps).map(this.renderPropEdit)}
          </React.Fragment>
        )}
      </div>
    )
  }
}

FormPropsInspector.propTypes = {
  inputProps: PropTypes.object,
  propValues: PropTypes.object,
  onPropValueChange: PropTypes.func
}
FormPropsInspector.defaultProps = {
  propValues: {}
}

export default compose(withStyles(styles))(FormPropsInspector)
