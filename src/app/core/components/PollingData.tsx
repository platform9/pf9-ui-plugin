// Libs
import React, { useState, useCallback } from 'react'
import moment from 'moment'
import Text from 'core/elements/text'
import { TypographyProps } from '@material-ui/core/Typography'
// Components
import Loading from 'core/components/Loading'
import useInterval from 'core/hooks/useInterval'

interface Props<T> {
  loading: boolean
  hidden?: boolean
  pause?: boolean
  pollIntervalMs?: number
  refreshDuration?: number
  textColor?: TypographyProps['color']
  onReload: (ignoreCache?: boolean) => void
}

const defaultRefreshDuration = 1000 * 60 * 5

function PollingData<T>({
  loading,
  onReload,
  hidden = false,
  pause = false,
  pollIntervalMs = 5000,
  refreshDuration = defaultRefreshDuration,
  textColor = 'textSecondary',
}: Props<T>) {
  const [lastIntervalTs, setLastIntervalTs] = useState(new Date().valueOf())
  const [lastFetchTs, setLastFetchTs] = useState(new Date().valueOf())
  const reload = useCallback(() => {
    const ts = new Date().valueOf()
    setLastFetchTs(ts)
    setLastIntervalTs(ts)
    onReload(true)
  }, [setLastFetchTs, setLastIntervalTs, onReload])

  if (!pause) {
    useInterval(() => {
      if (!loading) {
        setLastIntervalTs(new Date().valueOf())
      }
    }, pollIntervalMs)
    const currentTs = new Date().valueOf()
    if (currentTs - lastFetchTs > refreshDuration) {
      reload()
    }
  }

  if (hidden) {
    return null
  }

  return (
    <Loading loading={loading} justify="flex-start" onClick={pause ? undefined : reload} reverse>
      <Text variant="caption" color={textColor}>
        {loading ? 'loading...' : moment(lastIntervalTs).fromNow()}
      </Text>
    </Loading>
  )
}

export default PollingData
