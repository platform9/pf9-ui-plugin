import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import { Tooltip } from '@material-ui/core'
import Icon from '@material-ui/core/Icon/Icon'

const styles = theme => ({
  infoTooltip: {
    background: theme.palette.common.white,
    color: theme.palette.text.primary,
    borderRadius: 0,
    border: 0,
    maxWidth: 300,
    fontSize: 14,
    display: 'flex',
    flexFlow: 'row nowrap',
  },
  infoIcon: {
    fontSize: theme.spacing.unit * 2.4,
    paddingTop: '0.1rem',
    paddingRight: '0.5rem',
  }
})

@withStyles(styles)
class InfoTooltip extends React.Component {
  render () {
    const { info, classes, placement, children } = this.props
    return (
      info ? <Tooltip
        placement={placement}
        classes={{ tooltip: classes.infoTooltip }}
        title={<React.Fragment>
          <Icon className={classes.infoIcon} color="primary">
            <span>info</span>
          </Icon>
          <span>{info}</span>
        </React.Fragment>}
      >{children}</Tooltip> : children
    )
  }
}

InfoTooltip.defaultProps = {
  placement: 'right'
}

InfoTooltip.propTypes = {
  classes: PropTypes.object,
  info: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
}

const withInfoTooltip = Component => ({ info, ...props }) => {
  return <InfoTooltip info={info}>
    <Component {...props} />
  </InfoTooltip>
}

export { withInfoTooltip }

export default InfoTooltip
