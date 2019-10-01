import React, { PureComponent, forwardRef } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import { imageUrls } from 'app/constants'
import Typography from '@material-ui/core/Typography'
import { pick, omit, keys } from 'ramda'

const styles = theme => ({
  root: {
    display: 'flex',
    flexFlow: 'column nowrap',
    position: 'relative',
  },
  rootInline: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    position: 'relative',
  },
  message: {
    fontWeight: 'bold',
    fontSize: theme.typography.pxToRem(20),
    margin: '0 20px',
    color: 'inherit',
  },
  messageInline: {
    fontSize: theme.typography.pxToRem(14),
    color: 'inherit',
  },
  img: {
    maxHeight: '80%',
  },
  imgInline: {
    maxHeight: 25,
    opacity: 0.7,
  },
  status: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexWrap: 'nowrap',
    alignItems: 'center',
    flexFlow: ({ inline }) => inline ? 'row' : 'column',
    padding: ({ inline, minHeight }) => inline ? '0 1rem' : `${minHeight / 4}px 0`,
    minHeight: ({ inline, minHeight }) => inline ? 'unset' : minHeight / 2,
  },
  statusOverlayed: {
    position: 'absolute',
    zIndex: '10000',
    right: '0',
    left: '0',
    bottom: '0',
    top: '0',
    minWidth: ({ inline }) => inline ? 150 : 'unset'
  },
  content: {
    width: '100%',
  },
  contentLoading: {
    opacity: 0.3,
  },
  hiddenContent: {
    visibility: ({ inline }) => inline ? 'visible' : 'hidden',
    display: ({ inline }) => inline ? 'none' : 'inherit',
  },
})

@withStyles(styles)
class Progress extends PureComponent {
  state = {
    loading: this.props.loading,
    loadedOnce: false,
  }

  static getDerivedStateFromProps (props, state) {
    // If finished loading for the first time
    if (props.loading !== state.loading) {
      if (!props.loading && !state.loadedOnce) {
        return {
          loadedOnce: true,
          loading: props.loading,
        }
      }
      return {
        loading: props.loading,
      }
    }
    return null
  }

  renderStatus = () => {
    const {
      classes,
      loading = true,
      overlay = false,
      inline = false,
      message = null,
      renderLoadingImage,
      renderContentOnMount,
    } = this.props
    if (!loading) {
      return null
    }
    const { loadedOnce } = this.state

    return <div className={clsx(classes.status, {
      [classes.statusOverlayed]: overlay && loading && (renderContentOnMount || loadedOnce),
    })}>
      {renderLoadingImage &&
      <img alt="Loading..." src={imageUrls.loading} className={clsx(classes.img, {
        [classes.imgInline]: inline,
      })} />}
      {message && <Typography className={clsx(classes.message, {
        [classes.messageInline]: inline,
      })} variant="caption" color="textSecondary">
        {message}
      </Typography>}
    </div>
  }

  renderContent = () => {
    const {
      classes,
      renderContentOnMount,
      loading = true,
      overlay = false,
      children,
    } = this.props
    const { loadedOnce } = this.state

    if (!children || (!renderContentOnMount && !loadedOnce)) {
      return null
    }
    return <div className={clsx(classes.content, {
      [classes.hiddenContent]: loading && !overlay,
      [classes.contentLoading]: loading,
    })}>{children}</div>
  }

  render () {
    const {
      classes,
      inline = false,
      fixed = false,
    } = this.props

    return <div
      className={clsx(classes.root, {
        [classes.fixed]: fixed,
        [classes.rootInline]: inline,
      })}>
      {this.renderStatus()}
      {this.renderContent()}
    </div>
  }
}

Progress.propTypes = {
  loading: PropTypes.bool,
  renderContentOnMount: PropTypes.bool,
  renderLoadingImage: PropTypes.bool,
  message: PropTypes.string,
  overlay: PropTypes.bool,
  inline: PropTypes.bool,
  // eslint-disable-next-line react/no-unused-prop-types
  minHeight: PropTypes.number,
}

Progress.defaultProps = {
  loading: false,
  overlay: true,
  inline: false,
  renderContentOnMount: false,
  renderLoadingImage: true,
  message: 'Loading...',
  minHeight: 400,
}

// We need to use `forwardRef` as a workaround of an issue with material-ui Tooltip https://github.com/gregnb/mui-datatables/issues/595
export const withProgress = (Component, defaultProps = {}) => {
  const propKeys = keys(Progress.propTypes)
  return forwardRef((props, ref) => {
    const progressProps = pick(propKeys, { ...defaultProps, ...props })
    const rest = omit(propKeys, props)
    return <Progress {...progressProps}>
      <Component {...rest} ref={ref} />
    </Progress>
  })
}

export default Progress
