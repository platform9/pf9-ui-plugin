import React from 'react'
import PropTypes from 'prop-types'
import Button from 'core/elements/button'

const ExportDataButton = ({ children, color = 'primary', data, filename, variant }) => {
  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 4)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = filename
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <Button color={color} onClick={exportData}>
      {children}
    </Button>
  )
}

ExportDataButton.propTypes = {
  color: PropTypes.string,
  data: PropTypes.object.isRequired,
  filename: PropTypes.string.isRequired,
  variant: PropTypes.string,
}

export default ExportDataButton
