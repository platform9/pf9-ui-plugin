import React from 'react'
import PropTypes from 'prop-types'
import { withInfoTooltip } from 'app/core/components/InfoTooltip'
import { Typography } from '@material-ui/core'
import { compose } from 'app/utils/fp'
import KeyValues, { EntryShape } from 'core/components/KeyValues'
import withFormContext, { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  title: {
    marginBottom: theme.spacing(1)
  },
})

class KeyValuesField extends React.Component {
  render () {
    const { id, value, label, classes, ...restProps } = this.props
    return (
      <div id={id} className={classes.root}>
        <Typography variant="subtitle1" className={classes.title}>{label}</Typography>
        <KeyValues
          {...restProps}
          entries={value !== undefined ? value : []}
        />
      </div>
    )
  }
}

KeyValuesField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
  initialValue: PropTypes.arrayOf(EntryShape),
}

export default compose(
  withFormContext,
  withInfoTooltip,
  withStyles(styles),
)(KeyValuesField)
