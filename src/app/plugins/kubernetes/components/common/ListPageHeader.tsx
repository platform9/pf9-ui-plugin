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

interface IListPageHeaderProps<T> {
  report: IStatusCardWithFilterProps
  totalUsageFn: (items: T[]) => IUsageTotals
  loaderFn: Function
}
function ListPageHeader<T>({ loaderFn, report, totalUsageFn }: IListPageHeaderProps<T>) {
  const classes = useStyles({})
  const [data, loading, reload]: IUseDataLoader<T> = useDataLoader(loaderFn, null, {
    loadingFeedback: false,
  }) as any
  function noop(ignoreCache) {
    console.log(reload, ignoreCache)
    return []
  }
  const totals = totalUsageFn(data)
  return (
    <>
      <PollingData hidden loading={loading} onReload={noop} refreshDuration={1000 * 10} />
      <div className={classes.container}>
        <ListPageHeaderCard {...report} className={classes.card} />
        <UsageWidget title="Compute" stats={totals.compute} units="GHz" />
        <UsageWidget title="Memory" stats={totals.memory} units="GiB" />
        <UsageWidget title="Storage" stats={totals.disk} units="GiB" />
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
