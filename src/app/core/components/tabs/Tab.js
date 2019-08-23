import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import { withTabContext } from 'core/components/tabs/Tabs'

class Tab extends PureComponent {
  componentDidMount () {
    const { addTab, value, label } = this.props

    // The hash is prefixed to make it compatible with hashes in the URL.
    // This allows the page to be reloaded and the correct tab to be selected.
    addTab({ value: `#${value}`, label })
  }

  render () {
    const { activeTab, value, children } = this.props
    if (`#${value}` !== activeTab) { return null }
    return (
      <Typography component="div">{children}</Typography>
    )
  }
}

Tab.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string,
  children: PropTypes.node.isRequired,
}

export default withTabContext(Tab)
