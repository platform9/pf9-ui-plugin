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
import DonutWidget from 'core/components/widgets/DonutWidget'
import { PieDataEntry } from 'core/components/graphs/PieGraph'
import Theme from 'core/themes/model'

const useStyles = makeStyles<Theme, { actionRow: boolean; chartRow: boolean }>((theme) => ({
  headerIcon: {
    fontSize: '36px',
    color: theme.palette.dashboardCard.icon,
    height: '32px',
    marginTop: '6px',
  },
  spinner: {
    marginLeft: theme.spacing(1),
  },
  contentContainer: {
    display: 'grid',
    gridTemplateRows: ({ actionRow, chartRow }) =>
      `85px${actionRow ? ' 76px' : ''}${chartRow ? ' 1fr' : ''}`,
    backgroundColor: theme.palette.dashboardCard.background,
    minWidth: '270px',
    minHeight: '165px',
    padding: theme.spacing(2, 1, 1, 1),
    borderRadius: '5px',
    transition: 'transform .1s ease',
    boxShadow:
      '0 2.5px 1.5px -3.5px rgba(0, 0, 0, 0.2), 0 1.5px 7px 1px rgba(0, 0, 0, 0.12), 0 1px 3px -1.5px rgba(0, 0, 0, 0.14)',
    '&:hover': {
      backgroundColor: hexToRGBA(theme.palette.dashboardCard.background, 0.95),
      transform: 'scale(1.025)',
    },
    overflowX: 'hidden',
  },
  text: {
    color: theme.palette.dashboardCard.primary,
    fontSize: '40px',
  },
  cardTitle: {
    color: theme.palette.dashboardCard.text,
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
  header: {
    display: 'grid',
    gridTemplateColumns: '1fr 45px',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    borderBottom: `1px solid ${theme.palette.dashboardCard.divider}`,
  },
  links: {
    display: 'grid',
    gridTemplateColumns: '1fr 35px',
    alignContent: 'center',
    padding: theme.spacing(0, 1),
  },
  chart: {
    minHeight: 150,
    display: 'grid',
    alignContent: 'center',
    borderTop: ({ actionRow }) =>
      `${actionRow ? 1 : 0}px solid ${theme.palette.dashboardCard.divider}`,
  },
}))

type PropertyFunction<T> = (p: any) => T

export interface IStatusCardQuantity {
  quantity: number
  pieData?: PieDataEntry[]
  piePrimary?: string
  graphType?: 'usage' | 'donut'
}
export interface StatusCardProps {
  entity: string
  route: string
  addRoute: string
  title: string
  icon: string | PropertyFunction<JSX.Element>
  dataLoader: [Function, {}] // todo figure out typings here.
  quantityFn(data: any[]): IStatusCardQuantity
  actionRow?: boolean
  className?: string
}

const StatusCard: FunctionComponent<StatusCardProps> = ({
  entity,
  route,
  addRoute,
  title,
  icon,
  dataLoader,
  quantityFn,
  actionRow = true,
  className,
}) => {
  const [data, loading] = useDataLoader(...dataLoader)
  const { quantity, pieData, piePrimary, graphType = 'usage' } = quantityFn(data)
  const {
    contentContainer,
    headerIcon,
    cardTitle,
    text,
    arrowIcon,
    header,
    links,
    chart,
    spinner,
  } = useStyles({ chartRow: !!pieData, actionRow })

  const GraphComponent = graphType === 'donut' ? DonutWidget : PieUsageWidget

  return (
    <div className={clsx(contentContainer, className)}>
      <header className={header}>
        <Link to={route}>
          <Typography variant="h6" className={cardTitle}>
            {title}
          </Typography>
        </Link>
        <FontAwesomeIcon className={headerIcon}>{icon}</FontAwesomeIcon>
        {loading ? <CircularProgress size={32} /> : <span className={text}>{quantity}</span>}
      </header>
      {actionRow && (
        <div className={links}>
          <Link to={addRoute}>
            <CardButton>Add {entity}</CardButton>
          </Link>
          <Link to={route}>
            <FontAwesomeIcon size="2x" className={arrowIcon}>
              arrow-right
            </FontAwesomeIcon>
          </Link>
        </div>
      )}
      {pieData && (
        <div className={chart}>
          {loading ? (
            <CircularProgress className={spinner} size={64} />
          ) : (
            <GraphComponent sideLength={110} arcWidth={12} primary={piePrimary} data={pieData} />
          )}
        </div>
      )}
    </div>
  )
}

export default StatusCard
