import React from 'react'
import PropTypes from 'prop-types'
import SimpleLink from 'core/components/SimpleLink'

const ExternalLink = ({ url, children, newWindow }) => {
  const moreProps = newWindow ? { target: '_blank', rel: 'noopener' } : {}
  return (<SimpleLink src={url} {...moreProps}>{children}</SimpleLink>)
}

ExternalLink.propTypes = {
  // This should be an external link that includes the http(s) and the FQDN.
  url: PropTypes.string.isRequired,

  // Should this link open a new window (default: true)
  newWindow: PropTypes.bool,

  // The link contents.  Usually just simple text but can be any node.
  children: PropTypes.node.isRequired,
}

ExternalLink.defaultProps = {
  newWindow: true,
}

export default ExternalLink
