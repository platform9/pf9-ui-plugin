import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/styles'
import { imageUrlRoot } from 'app/constants'
import { pathJoin } from 'utils/misc'
import Theme from 'core/themes/model'

const useStyles = makeStyles((theme: Theme) => ({
  page: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.palette.grey[900],
    display: 'flex',
    flexFlow: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: 1120,
    height: 600,
    borderRadius: 16,
    border: `solid 1px ${theme.palette.grey[500]}`,
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    overflow: 'hidden',
  },
  managementPlane: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 80px',
  },
  formPane: {
    padding: '48px 24px 20px',
    backgroundColor: theme.palette.grey[800],
    display: 'grid',
    gridTemplateRows: '1fr 45px',
    alignItems: 'center',
    justifyItems: 'center',
    gridGap: theme.spacing(2),
  },
  '.MuiInputLabel-outlined.MuiInputLabel-shrink': {
    label: {
      color: theme.palette.blue[200],
    },
  },
  img: {
    maxWidth: '100%',
  },
  logo: {
    width: 200,
    marginBottom: theme.spacing(6),
  },
  formTitle: {
    color: theme.palette.blue[200],
    fontWeight: 600,
  },
}))

const FormPageContainer = ({ children }) => {
  const classes = useStyles({})
  return (
    <section id={`form-page-container`} className={clsx('form-page-container', classes.page)}>
      <img
        alt="Platform9"
        src={pathJoin(imageUrlRoot, 'primary-logo.svg')}
        className={classes.logo}
      />
      <article className={classes.container}>
        <div className={clsx('left-pane', classes.managementPlane)}>
          <img
            alt="Platform9 Management Plane"
            src={pathJoin(imageUrlRoot, 'management-plane.svg')}
            className={classes.img}
          />
        </div>
        <div className={clsx('right-pane', classes.formPane)}>{children}</div>
      </article>
    </section>
  )
}

export default FormPageContainer
