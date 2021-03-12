import { Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import SubmitButton from 'core/components/buttons/SubmitButton'
import Text from 'core/elements/text'
import Theme from 'core/themes/model'
import React from 'react'
import { getIcon } from './helpers'

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    display: 'grid',
    gridTemplateRows: '40px 200px auto',
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: 4,
    boxShadow: 'none',
    height: 'max-content',
    padding: theme.spacing(2),
    gridGap: theme.spacing(3),
  },
  topContent: {
    display: 'flex',
    flexFlow: 'column nowrap',
  },
  logo: {
    alignSelf: 'center',
    marginBottom: theme.spacing(2),
    width: '100px',
    maxHeight: '120px',
  },
  middleContent: {
    display: 'grid',
    gridGap: theme.spacing(2),
    justifyItems: 'center',
    gridTemplateRows: '120px 1fr',
  },
  description: {
    display: '-webkit-box',
    overflow: 'hidden',
    WebkitLineClamp: 3,
    textOverflow: 'ellipsis',
    WebkitBoxOrient: 'vertical',
    height: 'max-content',
    alignSelf: 'center',
  },
  bottomContent: {
    display: 'grid',
    gridTemplateColumns: 'auto 120px',
    alignItems: 'baseline',
  },
}))

const AppCard = ({ app, onClick }) => {
  const classes = useStyles()
  const { name, repository, icon, description, version } = app

  const handleOnClick = () => {
    onClick(app)
  }

  return (
    <Grid item sm={6} md={4} lg={3} xl={2}>
      <div className={classes.card}>
        <div className={classes.topContent}>
          <Text variant="subtitle2">{name}</Text>
          <Text variant="body2">Repository {repository}</Text>
        </div>
        <div className={classes.middleContent}>
          <img className={classes.logo} src={getIcon(icon)} />
          <Text variant="body2" component="p" className={classes.description}>
            {description}{' '}
          </Text>
        </div>
        <div className={classes.bottomContent}>
          <Text variant="caption1">v{version}</Text>
          <SubmitButton onClick={handleOnClick}>Deploy</SubmitButton>
        </div>
      </div>
    </Grid>
  )
}

export default AppCard
