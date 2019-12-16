import React from 'react'
import PropTypes from 'prop-types'
import { Typography } from '@material-ui/core'
import { lensPath, set } from 'ramda'
import { connect } from 'react-redux'
import { themeStoreKey, themeActions } from 'core/themes/themeReducers'
import { bindActionCreators } from 'redux'

@connect(
  store => ({ theme: store[themeStoreKey] }),
  dispatch => ({ actions: bindActionCreators(themeActions, dispatch) }),
)
class TypographyVariant extends React.PureComponent {
  lens = () => lensPath(this.props.path.split('.'))

  handleChange = color => this.props.actions.setTheme(
    set(this.lens(), color.hex, this.props.theme),
  )

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

export default TypographyVariant
