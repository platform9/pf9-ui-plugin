import React, { FC } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/styles'

import Button from 'core/elements/button'
import Theme from 'core/themes/model'

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    marginTop: theme.spacing(3),
  },
}))

interface Props {
  className?: string
  form?: any
}

const SubmitButton: FC<Props> = ({ className, children, form }) => {
  const classes = useStyles({})
  return (
    <Button className={clsx(classes.root, className)} type="submit" color="primary" form={form}>
      {children}
    </Button>
  )
}

export default SubmitButton
