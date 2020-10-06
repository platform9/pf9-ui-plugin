// Libs
import React, { FunctionComponent } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
// Hooks
import { makeStyles } from '@material-ui/styles'
import useDataLoader from 'core/hooks/useDataLoader'
// Components
import { CircularProgress } from '@material-ui/core'
import Text from 'core/elements/text'
import CardButton from 'core/components/buttons/CardButton'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import PieUsageWidget from 'core/components/widgets/PieUsageWidget'
import DonutWidget from 'core/components/widgets/DonutWidget'
import { PieDataEntry } from 'core/components/graphs/PieGraph'
import Theme from 'core/themes/model'

const useStyles = makeStyles<Theme, { actionRow: boolean; chartRow: boolean }>((theme) => ({
  headerIcon: {
    fontSize: '30px',
    color: theme.palette.grey[700],
    height: '26px',
    marginTop: '6px',
  },
  spinner: {
    marginLeft: theme.spacing(1),
  },
  contentContainer: {
    display: 'grid',
    gridTemplateRows: ({ actionRow, chartRow }) =>
      `60px${actionRow ? ' 85px' : ''}${chartRow ? ' 1fr' : ''}`,
    minWidth: '275px',
    minHeight: '135px',
    border: `solid 1px ${theme.palette.grey[300]}`,
    borderRadius: 4,
    padding: theme.spacing(1, 1, 0, 1),
    backgroundColor: theme.palette.grey['000'],
    overflowX: 'hidden',
  },
  text: {
    color: theme.palette.grey[900],
    fontWeight: 100,
    backgroundColor: theme.palette.grey['000'],
    position: 'relative',
    bottom: -23,
    padding: theme.spacing(0, 3, 0, 2),
  },
  cardTitle: {
    color: theme.palette.grey[900],
    paddingLeft: theme.spacing(0.5),
  },
  cardTitleLink: {
    display: 'grid',
    gridTemplateColumns: 'minmax(min-content, max-content) 1fr',
    alignItems: 'baseline',
  },
  arrowIcon: {
    background: theme.components.dashboardCard.primary,
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
    gridTemplateColumns: '1fr 35px',
    alignItems: 'center',
    padding: theme.spacing(0, 1, 0, 0),
    borderBottom: `1px solid ${theme.components.dashboardCard.divider}`,
  },
  links: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1, 2, 1),
  },
  chart: {
    minHeight: 150,
    display: 'grid',
    alignContent: 'center',
    justifyItems: 'center',
    color: theme.palette.grey[900],
    borderTop: ({ actionRow }) =>
      `${actionRow ? 1 : 0}px solid ${theme.components.dashboardCard.divider}`,
  },
  addAction: {
    gridArea: 'add-action',
  },
  listAction: {
    gridArea: 'list-action',
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
    cardTitleLink,
    text,
    header,
    links,
    chart,
    spinner,
    addAction,
  } = useStyles({ chartRow: !!pieData, actionRow })

  const GraphComponent = graphType === 'donut' ? DonutWidget : PieUsageWidget

  return (
    <div className={clsx(contentContainer, className)}>
      <header className={header}>
        <Link to={route} className={cardTitleLink}>
          <Text variant="h1" className={text}>
            {loading ? <CircularProgress size={38} color="inherit" /> : quantity}
          </Text>
          <Text variant="body2" component="h2" className={cardTitle}>
            {title}
          </Text>
        </Link>
        <FontAwesomeIcon className={headerIcon}>{icon}</FontAwesomeIcon>
      </header>
      {actionRow && addRoute && (
        <div className={links}>
          <Link to={addRoute} className={addAction}>
            <CardButton>Add {entity}</CardButton>
          </Link>
        </div>
      )}
      {pieData && (
        <div className={chart}>
          {loading ? (
            <CircularProgress className={spinner} color="inherit" size={64} />
          ) : (
            <GraphComponent sideLength={110} arcWidth={12} primary={piePrimary} data={pieData} />
          )}
        </div>
      )}
    </div>
  )
}

export default StatusCard
