import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    cursor: 'pointer',
    color: theme.palette.primary.main,
    fontSize: 18,
    fontWeight: 400,
  },
}))

const ExpandIcon = ({ onClick }) => {
  const classes = useStyles()
  return (
    <FontAwesomeIcon onClick={onClick} className={classes.root} size="md" solid>
      search-plus
    </FontAwesomeIcon>
  )
}

export default ExpandIcon
