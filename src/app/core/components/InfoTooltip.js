import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import { Tooltip } from '@material-ui/core'
import Icon from '@material-ui/core/Icon/Icon'
import moize from 'moize'

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
    paddingTop: 0,
    marginTop: 0,
  },
  infoIcon: {
    fontSize: theme.spacing(2.4),
    paddingTop: '0.1rem',
    paddingRight: '0.5rem',
  },
})

@withStyles(styles)
class InfoTooltip extends PureComponent {
  renderTitle = moize(info => <React.Fragment>
    <Icon className={this.props.classes.infoIcon} color="primary">
      <span>info</span>
    </Icon>
    <span>{info}</span>
  </React.Fragment>)

  render () {
    const { info, classes = {}, placement, open, children } = this.props

    return (
      info ? <Tooltip
        interactive
        open={open}
        placement={placement}
        classes={{ tooltip: classes.infoTooltip }}
        title={this.renderTitle(info)}
      >{children}</Tooltip> : children
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
const withInfoTooltip = Component => React.forwardRef(({ info, ...props }, ref) =>
  <InfoTooltip info={info}>
    <Component {...props} ref={ref} />
  </InfoTooltip>,
)

export { withInfoTooltip }

export default InfoTooltip
