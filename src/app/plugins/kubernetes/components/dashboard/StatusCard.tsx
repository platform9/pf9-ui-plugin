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

const chartHeight = 150
const actionHeight = 76

const getCardHeight = ({ actionRow, chartRow }) => {
  let height = 80
  if (chartRow) height += chartHeight
  if (actionRow) height += actionHeight
  return height
}

const useStyles = makeStyles<Theme, { actionRow: boolean; chartRow: boolean }>((theme) => ({
  headerIcon: {
    fontSize: '36px',
    color: theme.palette.dashboardCard.icon,
  },
  spinner: {
    marginLeft: theme.spacing(1),
  },
  contentContainer: {
    backgroundColor: theme.palette.dashboardCard.background,
    minWidth: '270px',
    height: getCardHeight,
    padding: theme.spacing(2.5, 1, 0.5, 1),
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
  row: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    '&:first-of-type': {
      borderBottom: `1px solid ${theme.palette.dashboardCard.divider}`,
    },
  },
  rowColumn: {
    padding: theme.spacing(0, 1),
  },
  text: {
    color: theme.palette.dashboardCard.primary,
    marginLeft: theme.spacing(1),
    fontSize: '40px',
  },
  cardTitle: {
    marginLeft: theme.spacing(1),
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
  verticalCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  horizontalCenter: {
    flexGrow: 1,
    textAlign: 'center',
  },
  header: {
    minHeight: actionHeight,
  },
  links: {
    minHeight: actionHeight,
    borderBottom: `1px solid ${theme.palette.dashboardCard.divider}`,
  },
  chart: {
    minHeight: chartHeight,
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
    row,
    rowColumn,
    contentContainer,
    headerIcon,
    spinner,
    cardTitle,
    text,
    arrowIcon,
    verticalCenter,
    horizontalCenter,
    header,
    links,
    chart,
  } = useStyles({ chartRow: !!pieData, actionRow })

  const GraphComponent = graphType === 'donut' ? DonutWidget : PieUsageWidget

  return (
    <div className={clsx(contentContainer, className)}>
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
          ) : (
            <span className={text}>{quantity}</span>
          )}
        </div>
      </div>
      {actionRow && (
        <div className={clsx(row, links, verticalCenter)}>
          <div className={rowColumn}>
            <Link to={addRoute}>
              <CardButton>Add {entity}</CardButton>
            </Link>
          </div>
          <div className={rowColumn}>
            <Link to={route}>
              <FontAwesomeIcon size="2x" className={arrowIcon}>
                arrow-right
              </FontAwesomeIcon>
            </Link>
          </div>
        </div>
      )}
      {pieData && (
        <div className={clsx(row, chart, verticalCenter)}>
          {loading ? (
            <div className={horizontalCenter}>
              <CircularProgress className={spinner} size={64} />
            </div>
          ) : (
            <GraphComponent sideLength={110} arcWidth={12} primary={piePrimary} data={pieData} />
          )}
        </div>
      )}
    </div>
  )
}

export default StatusCard
