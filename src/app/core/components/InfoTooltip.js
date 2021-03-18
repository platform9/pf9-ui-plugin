import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import { Tooltip } from '@material-ui/core'

import moize from 'moize'
import FontAwesomeIcon from './FontAwesomeIcon'

const styles = (theme) => ({
  infoTooltip: {
    background: theme.palette.common.white,
    color: theme.palette.text.primary,
    border: 0,
    maxWidth: 300,
    fontSize: 14,
    display: 'flex',
    flexFlow: 'row nowrap',
    borderRadius: 3,
    marginTop: -7,
  },
  infoIcon: {
    fontSize: theme.spacing(2.5),
    paddingTop: 4,
    paddingRight: 4,
    color: theme.palette.blue.main,
    width: 19,
    height: 19,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTipContainer: {
    display: 'flex',
  },
})

@withStyles(styles)
class InfoTooltip extends PureComponent {
  // for some reason the styles are not propagating to the info tooltip
  renderTitle = moize((info) => (
    <div className="flex">
      <FontAwesomeIcon className="info-tooltip-icon">info-circle</FontAwesomeIcon>
      <span>{info}</span>
    </div>
  ))

  render() {
    const { info, classes = {}, placement, open, children } = this.props

    return info ? (
      <Tooltip
        interactive
        open={open}
        placement={placement}
        classes={{ tooltip: classes.infoTooltip }}
        title={this.renderTitle(info)}
      >
        {children}
      </Tooltip>
    ) : (
      children
    )
  }
}

InfoTooltip.defaultProps = {
  placement: 'right-start',
}

InfoTooltip.propTypes = {
  open: PropTypes.bool,
  classes: PropTypes.object,
  placement: PropTypes.string,
  info: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
}

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
const withInfoTooltip = (Component) =>
  React.forwardRef(({ info, infoPlacement, ...props }, ref) => (
    <InfoTooltip info={info} placement={infoPlacement}>
      <Component {...props} ref={ref} />
    </InfoTooltip>
  ))

export { withInfoTooltip }

export default InfoTooltip
