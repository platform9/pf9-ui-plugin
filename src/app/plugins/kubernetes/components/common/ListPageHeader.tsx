// Libs
import React from 'react'
import useDataLoader from 'core/hooks/useDataLoader'
import { makeStyles } from '@material-ui/styles'

// Components
import ListPageHeaderCard from './ListPageHeaderCard'
import UsageWidget from 'core/components/widgets/UsageWidget'

// Types
import { IStatusCardWithFilterProps } from '../dashboard/DashboardPage'
import Theme from 'core/themes/model'
import PollingData from 'core/components/PollingData'
import { IUseDataLoader } from '../infrastructure/nodes/model'
import ListAction from 'core/actions/ListAction'
import { Dictionary } from 'ramda'
import { RootState } from 'app/store'
import { ParametricSelector } from 'reselect'

interface IUsageTotal {
  current: number
  max: number
  percent: number
}
interface IUsageTotals {
  compute: IUsageTotal
  memory: IUsageTotal
  disk: IUsageTotal
}

type AnyDictionary = Dictionary<any>
interface IListPageHeaderProps<T> {
  report: IStatusCardWithFilterProps
  totalUsageFn?: (items: T[]) => IUsageTotals
  loaderFn?: Function
  dataLoader?: [Function, {}] // todo figure out typings here.
  listAction?: ListAction<AnyDictionary[], AnyDictionary> // todo fix typings here
  dataSelector?: ParametricSelector<RootState, AnyDictionary, AnyDictionary[]> // todo fix typings here
  documentMeta?: JSX.Element
  hideUsage?: Boolean
}
function ListPageHeader<T>({
  loaderFn,
  listAction,
  dataSelector,
  report,
  totalUsageFn,
  documentMeta,
  hideUsage,
}: IListPageHeaderProps<T>) {
  const classes = useStyles({})
  const [data, loading, reload]: IUseDataLoader<T> = useDataLoader(loaderFn, null, {
    loadingFeedback: false,
  }) as any
  const totals = totalUsageFn && totalUsageFn(data)
  return (
    <>
      {documentMeta && documentMeta}
      <PollingData hidden loading={loading} onReload={reload} refreshDuration={1000 * 30} />
      <div className={classes.container}>
        <ListPageHeaderCard {...report} className={classes.card} />
        {!hideUsage && (
          <>
            <UsageWidget title="Compute" stats={totals.compute} units="GHz" />
            <UsageWidget title="Memory" stats={totals.memory} units="GiB" />
            <UsageWidget title="Storage" stats={totals.disk} units="GiB" />
          </>
        )}
      </div>
    </>
  )
}

export default ListPageHeader

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    display: 'grid',
    gridTemplateColumns: '450px repeat(3, 250px)',
    gridGap: theme.spacing(2),
  },
  card: {
    marginRight: theme.spacing(),
  },
}))
