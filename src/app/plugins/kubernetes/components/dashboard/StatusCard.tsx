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
import PieUsageWidget from 'core/components/widgets/PieUsageWidget'
import { PieDataEntry } from 'core/components/graphs/PieGraph'

const useStyles = makeStyles((theme: any) => ({
  headerIcon: {
    fontSize: '36px',
    color: theme.palette.dashboardCard.icon,
  },
  spinner: {
    marginLeft: theme.spacing(1),
  },
  contentContainer: {
    backgroundColor: theme.palette.dashboardCard.background,
    width: '280px',
    height: ({ pieData }: any) => pieData ? '360px' : '170px',
    margin: theme.spacing(1.25),
    padding: theme.spacing(2.5, 1, 0.5, 1),
    borderRadius: '5px',
    transition: 'transform .1s ease',
    boxShadow: '0 2.5px 1.5px -3.5px rgba(0, 0, 0, 0.2), 0 1.5px 7px 1px rgba(0, 0, 0, 0.12), 0 1px 3px -1.5px rgba(0, 0, 0, 0.14)',
    '&:hover': {
      backgroundColor: hexToRGBA(theme.palette.dashboardCard.background, 0.95),
      transform: 'scale(1.025)'
    },
    overflowX: 'hidden',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    marginBottom: theme.spacing(1),
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    '&:first-of-type': {
      borderBottom: `1px solid ${theme.palette.dashboardCard.divider}`,
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
    fontWeight: 800,
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
    display: 'flex',
    alignItems: 'center',
  },
  horizontalCenter: {
    flexGrow: 1,
    textAlign: 'center',
  },
  header: {
    height: '76px',
  },
  links: {
    height: '76px',
  },
  chart: {
    borderTop: `1px solid ${theme.palette.dashboardCard.divider}`,
    height: '180px',
  },
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
  quantityFn(data: any[]): { quantity: number, pieData: PieDataEntry[], piePrimary: string }
}

const StatusCard: FunctionComponent<StatusCardProps> = ({ entity, route, addRoute, title, icon, dataLoader, quantityFn }) => {
  const [data, loading] = useDataLoader(...dataLoader)
  const { quantity, pieData, piePrimary } = quantityFn(data)
  const {
    row, rowColumn, contentContainer, headerIcon, spinner, cardTitle, text, arrowIcon,
    verticalCenter, horizontalCenter, header, links, chart
  } = useStyles({ pieData: !!pieData })

  return (
    <div className={contentContainer}>
      <div className={clsx(row, header)}>
        <div className={rowColumn}>
          <Link to={route}>
            <Typography variant="h6" className={cardTitle}>
              {title}
            </Typography>
          </Link>
        </div>
        <div className={clsx(rowColumn, verticalCenter)}>
          <FontAwesomeIcon className={headerIcon}>{icon}</FontAwesomeIcon>
          {loading ? (
            <CircularProgress className={spinner} size={32} />
          ): (
            <span className={text}>{quantity}</span>
          )}
        </div>
      </div>
      <div className={clsx(row, links, verticalCenter)}>
        <div className={rowColumn}>
          <Link to={addRoute}>
            <CardButton>Add {entity}</CardButton>
          </Link>
        </div>
        <div className={rowColumn}>
          <Link to={route}>
            <FontAwesomeIcon size="2x" className={arrowIcon}>arrow-right</FontAwesomeIcon>
          </Link>
        </div>
      </div>
      {pieData && <div className={clsx(row, chart, verticalCenter)}>
        {loading ? (
          <div className={horizontalCenter}>
            <CircularProgress className={spinner} size={64} />
          </div>
        ) : (
          <PieUsageWidget sideLength={110} arcWidth={12} primary={piePrimary} data={pieData} />
        )}
      </div>}
    </div>
  )
}

export default StatusCard
