import React from 'react'
import { Card, CardHeader, CardContent, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import PropTypes from 'prop-types'

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: 'none',
    minWidth: 250,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 4,
    border: `1px solid ${theme.palette.gray[300]}`,
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
    position: 'relative',
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: ({ image }) => (image ? 'space-between' : 'center'),
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    '& h6': {
      color: theme.palette.gray[700],
      backgroundColor: theme.palette.gray['000'],
      padding: '0 12px',
      zIndex: 1,
    },
    '&:before': {
      content: '""',
      backgroundColor: theme.palette.gray[300],
      borderRadius: 4,
      position: 'absolute',
      left: 0,
      right: 0,
      top: '50%',
      height: 1,
      zIndex: 0,
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
