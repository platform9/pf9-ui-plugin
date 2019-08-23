import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import clsx from 'clsx'
import { imageUrls } from 'app/constants'
import Typography from '@material-ui/core/Typography'

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
    flexFlow: 'column nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '4rem',
    minHeight: 200,
  },
  statusHidden: {
    display: 'none'
  },
  statusInline: {
    padding: '0 1rem',
    flexFlow: 'row nowrap',
    minHeight: 'unset'
  },
  statusOverlayed: {
    position: 'absolute',
    zIndex: '10000',
    right: '0',
    left: '0',
    bottom: '0',
    top: '0',
  },
  content: {
    width: '100%',
  },
  contentLoading: {
    opacity: 0.3,
  },
  hiddenContent: {
    visibility: 'hidden',
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
    const { loadedOnce } = this.state

    return <div className={clsx(classes.status, {
      [classes.statusHidden]: !loading,
      [classes.statusInline]: inline,
      [classes.statusOverlayed]: overlay && loading && (renderContentOnMount || loadedOnce),
    })}>
      {renderLoadingImage && <img alt="Loading..." src={imageUrls.loading} className={clsx(classes.img, {
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
}

Progress.defaultProps = {
  loading: false,
  overlay: true,
  inline: false,
  renderContentOnMount: false,
  renderLoadingImage: true,
  message: 'Loading...',
}

export const withProgress = Component => ({ overlay, inline, loading, ...props }) =>
  <Progress overlay={overlay} inline={inline} loading={loading}>
    <Component {...props} />
  </Progress>

export default Progress
