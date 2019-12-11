// Libs
import React, { FunctionComponent } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
// Hooks
import { makeStyles } from '@material-ui/styles'
import useDataLoader from 'core/hooks/useDataLoader'
// Components
import { Typography, CircularProgress } from '@material-ui/core'
import { hexToRGBA } from 'core/utils/colorHelpers'
import CardButton from 'core/components/buttons/CardButton'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'

const useStyles = makeStyles((theme: any) => ({
  headerIcon: {
    width: theme.spacing(5),
    height: theme.spacing(5),
    color: theme.palette.dashboardCard.icon,
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.dashboardCard.background,
    width: '280px',
    height: '170px',
    margin: theme.spacing(1),
    padding: theme.spacing(2.5, 1, 0.5, 1),
    borderRadius: '5px',
    transition: 'transform .1s ease',
    boxShadow: '1px 1px 4px -2px rgba(0,0,0,0.35)',
    '&:hover': {
      backgroundColor: hexToRGBA(theme.palette.dashboardCard.background, 0.95),
      transform: 'scale(1.025)'
    }
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    marginBottom: theme.spacing(1),
    flex: 1,
    justifyContent: 'space-between',
    '&:first-of-type': {
      borderBottom: `1px solid ${theme.palette.dashboardCard.divider}`
    }
  },
  rowColumn: {
    padding: theme.spacing(0, 1)
  },
  text: {
    color: theme.palette.dashboardCard.primary,
    marginLeft: theme.spacing(1),
    fontSize: '40px'
  },
  cardTitle: {
    marginLeft: theme.spacing(1),
    fontWeight: 'bold',
    color: theme.palette.dashboardCard.text,
    fontSize: '14px',
  },
  arrowIcon: {
    background: theme.palette.dashboardCard.primary,
    height: '32px',
    width: '32px',
    color: theme.palette.primary.contrastText,
    borderRadius: '50%',
    fontSize: '18px',
    '&:before': {
      position: 'relative',
      top: '7px',
    },
  },
  verticalCenter: {
    alignSelf: 'center',
  }
}))

type PropertyFunction<T> = (p: any) => T

interface StatusCardProps {
  entity: string
  route: string
  addRoute: string
  title: string
  icon: string | PropertyFunction<JSX.Element>
  quantity: number
  dataLoader: [() => any, {}] // todo figure out typings here.
  quantityFn(data: any[]): { quantity: number, working: number, pending: number }
}

const StatusCard: FunctionComponent<StatusCardProps> = ({ entity, route, addRoute, title, icon: Icon, dataLoader, quantityFn }) => {
  const { row, rowColumn, contentContainer, headerIcon, cardTitle, progress, text, arrowIcon, verticalCenter } = useStyles({})
  const [data, loading] = useDataLoader(...dataLoader)
  const { quantity } = quantityFn(data)
  const iconComponent =
    typeof Icon === 'string' ? (
      <img className={headerIcon} alt="" src={Icon} />
    ) : (
      <Icon className={headerIcon} color="primary" />
    )
  return (
    <div className={contentContainer}>
      <div className={row}>
        <div className={rowColumn}>
          <Link to={route}>
            <Typography variant="h6" className={cardTitle}>
              {title}
            </Typography>
          </Link>
        </div>
        <div className={rowColumn}>
          {iconComponent}
          {loading ? (
            <CircularProgress size={32} />
          ): (
            <span className={text}>{quantity}</span>
          )}
        </div>
      </div>
      <div className={row}>
        <div className={clsx(rowColumn, verticalCenter)}>
          <Link to={addRoute}>
            <CardButton>Add {entity}</CardButton>
          </Link>
        </div>
        <div className={clsx(rowColumn, verticalCenter)}>
          <Link to={route}>
            <FontAwesomeIcon size="2x" className={arrowIcon}>arrow-right</FontAwesomeIcon>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default StatusCard
