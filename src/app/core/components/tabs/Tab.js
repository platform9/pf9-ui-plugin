import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Text from 'core/elements/text'
import { withTabContext } from 'core/components/tabs/Tabs'

class Tab extends PureComponent {
  componentDidMount() {
    const { addTab, value, label } = this.props
    addTab({ value, label })
  }

  render() {
    const { activeTab, value, children, className } = this.props
    if (value !== activeTab) {
      return null
    }
    return (
      <Text component="div" className={className}>
        {children}
      </Text>
    )
  }
}

Tab.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string.isRequired,
  label: PropTypes.string,
  children: PropTypes.node.isRequired,
}

export default withTabContext(Tab)
