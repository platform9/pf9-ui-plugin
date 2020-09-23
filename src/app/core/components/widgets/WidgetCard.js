import React from 'react'
import { Card, CardHeader, CardContent, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import PropTypes from 'prop-types'

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: '0 1px 6px 1px rgba(0, 0, 0, 0.12)',
    minWidth: 250,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.common.white,
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    flex: 1,
    backgroundColor: theme.palette.common.white,
    paddingTop: 0,
    paddingBottom: theme.spacing(1.5),
    '&:last-child': {
      paddingBottom: theme.spacing(1.5),
    },
  },
  headerContent: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: ({ image }) => (image ? 'space-between' : 'flex-start'),
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    '& h6': {
      color: theme.components.dashboardCard.text,
    },
  },
  headerImg: {
    maxHeight: 40,
    '& img': {
      maxHeight: 'inherit',
    },
  },
}))

const HeaderContent = ({ title, image }) => {
  const { headerContent, headerImg } = useStyles({ image })
  return (
    <div className={headerContent}>
      <Typography variant="h6">{title}</Typography>
      {image && (
        <div className={headerImg}>
          {typeof image === 'string' ? <img alt="" src={image} /> : image}
        </div>
      )}
    </div>
  )
}

const WidgetCard = ({ title, headerImg, children }) => {
  const classes = useStyles()
  return (
    <Card className={classes.root}>
      <CardHeader
        className={classes.header}
        title={<HeaderContent title={title} image={headerImg} />}
      />
      <CardContent className={classes.content}>{children}</CardContent>
    </Card>
  )
}

WidgetCard.propTypes = {
  headerImg: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  title: PropTypes.string.isRequired,
}

export default WidgetCard
