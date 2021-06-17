import React, { FunctionComponent } from 'react'
// Hooks
import { makeStyles } from '@material-ui/styles'
import useDataLoader from 'core/hooks/useDataLoader'
// Components
import Text from 'core/elements/text'
import PieUsageWidget from 'core/components/widgets/PieUsageWidget'
import DonutWidget from 'core/components/widgets/DonutWidget'
import { PieDataEntry } from 'core/components/graphs/PieGraph'
import Theme from 'core/themes/model'
import { CircularProgress } from '@material-ui/core'

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
  className?: string
}

const ListPageHeaderCard: FunctionComponent<StatusCardProps> = ({
  title,
  dataLoader,
  quantityFn,
}) => {
  const classes = useStyles({})
  const [data, loading] = useDataLoader(...dataLoader)
  const { quantity, pieData, piePrimary, graphType = 'usage' } = quantityFn(data)

  const GraphComponent = graphType === 'donut' ? DonutWidget : PieUsageWidget

  return (
    <div className={classes.card}>
      <div className={classes.count}>
        <Text variant="h1">{quantity}</Text>
      </div>
      <div className={classes.title}>
        <Text variant="body2" component="h2">
          {title}
        </Text>
      </div>
      <div className={classes.graph}>
        {loading ? (
          <CircularProgress className={classes.spinner} size={64} />
        ) : (
          <GraphComponent sideLength={115} arcWidth={16} primary={piePrimary} data={pieData} />
        )}
      </div>
    </div>
  )
}

const useStyles = makeStyles<Theme>((theme) => ({
  card: {
    display: 'grid',
    gridTemplateAreas: '"phc-count phc-title" "phc-count phc-graph"',
    gridTemplateColumns: '100px 1fr',
    gridTemplateRows: '38px 1fr',
    borderRadius: 4,
    border: `solid 1px ${theme.palette.grey[300]}`,
    backgroundColor: theme.palette.grey['000'],
    padding: theme.spacing(1.5, 2, 0, 0),
    marginRight: 17,
    minHeight: 210,
  },
  count: {
    gridArea: 'phc-count',
    '& h1': {
      textAlign: 'center',
      fontWeight: 'normal',
      color: theme.palette.grey[900],
    },
  },
  title: {
    gridArea: 'phc-title',
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
    paddingBottom: 4,
    paddingLeft: 4,
    display: 'flex',
    alignItems: 'flex-end',
    '& h2': {
      color: theme.palette.grey[700],
    },
  },
  graph: {
    gridArea: 'phc-graph',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  spinner: {
    marginLeft: theme.spacing(1),
  },
}))

export default ListPageHeaderCard
