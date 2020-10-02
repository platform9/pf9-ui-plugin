import React from 'react'
import PropTypes from 'prop-types'
import Button from 'core/elements/button'
import { withStyles } from '@material-ui/styles'
import clsx from 'clsx'

const styles = (theme) => ({
  root: {
    marginTop: theme.spacing(3),
  },
})

const SubmitButton = ({ className, classes, children, form }) => (
  <Button className={clsx(classes.root, className)} type="submit" color="primary" form={form}>
    {children}
  </Button>
)

SubmitButton.propTypes = {
  children: PropTypes.node.isRequired,
}

export default withStyles(styles)(SubmitButton)
