import React from 'react'
import PropTypes from 'prop-types'
import { Typography } from '@material-ui/core'
import { compose, lensPath, set } from 'ramda'
import { withAppContext } from 'core/providers/AppProvider'

class TypographyVariant extends React.PureComponent {
  lens = () => lensPath(this.props.path.split('.'))

  handleChange = color => this.props.setContext({
    theme: set(this.lens(), color.hex, this.props.context.theme)
  })

  render () {
    const { variant } = this.props
    return (
      <div>
        <Typography variant="h6">{variant}</Typography>
      </div>
    )
  }
}

TypographyVariant.propTypes = {
  variant: PropTypes.string.isRequired,
}

export default compose(
  withAppContext,
)(TypographyVariant)
