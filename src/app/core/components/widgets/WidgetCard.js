import React from 'react'
import { Card, CardHeader, CardContent } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import PropTypes from 'prop-types'

const useStyles = makeStyles(theme => ({
  root: {
    boxShadow: 'none',
  },
  header: {
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.card.background,
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: theme.palette.card.background,
    paddingTop: 0,
    paddingBottom: theme.spacing(1.5),
    '&:last-child': {
      paddingBottom: theme.spacing(1.5),
    }
  },
  headerContent: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
  },
  headerImg: {
    maxHeight: 40,
    '& img': {
      maxHeight: 'inherit',
    },
  },
}))

const HeaderContent = ({ title, image }) => {
  const { headerContent, headerImg } = useStyles()
  return <div className={headerContent}>
    <div>
      {title}
    </div>
    {image && <div className={headerImg}>
      {typeof image === 'string' ? <img alt="" src={image} /> : image}
    </div>}
  </div>
}

const WidgetCard = ({ title, headerImg, children }) => {
  const classes = useStyles()
  return <Card className={classes.root}>
    <CardHeader className={classes.header} title={
      <HeaderContent title={title} image={headerImg} />} />
    <CardContent className={classes.content}>
      {children}
    </CardContent>
  </Card>
}

WidgetCard.propTypes = {
  headerImg: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  title: PropTypes.string.isRequired,
}

export default WidgetCard
