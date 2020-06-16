import React from 'react'
import PropTypes from 'prop-types'
import { Typography } from '@material-ui/core'

const TypographyVariant = () => {
  const { variant } = this.props
  return (
    <div>
      <Typography variant="h6">{variant}</Typography>
    </div>
  )
}

TypographyVariant.propTypes = {
  variant: PropTypes.string.isRequired,
}

export default TypographyVariant
