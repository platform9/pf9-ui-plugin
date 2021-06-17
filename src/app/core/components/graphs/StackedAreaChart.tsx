import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useTheme } from '@material-ui/core/styles'
import { pathStr } from 'utils/fp'

/*
  Usage:
  type IRequiredAreaChartTypes = 'warning' | 'critical' | 'fatal'

  const exampleData = [
    {
      time: '8:00',
      warning: 5,
      critical: 10,
      fatal: 15,
    },
    ...
  ]

  const exampleTypes = [
    {
      name: 'warning',
      color: 'warning',
    },
    ...
  ]

  const exampleAxis = 'time'

  <StackedAreaChart<'time', IRequiredAreaChartTypes>
    values={exampleData}
    keys={exampleTypes}
    xAxis="time"
  />

*/

type AreaChartEntry<T extends string, V extends string> = { [P in T | V]: any }

export interface AreaChartType<T> {
  name: T
  color: string
  icon?: string
}

// types should be a list of strings that also show up in AreaChartEntry as a property
interface Props<T extends string, V extends string> {
  values: Array<AreaChartEntry<T, V>>
  width?: number
  height?: number
  xAxis: T
  keys: Array<AreaChartType<V>>
  responsive?: boolean
  responsiveHeight?: number
  verticalAxisLines?: boolean
  CustomTooltip?: JSX.Element
}

// Todo: Instead of a set width and height, also allow for percents
function StackedAreaChart<Axis extends string, Types extends string>({
  values,
  width = 600,
  height = 400,
  keys,
  xAxis,
  verticalAxisLines = false,
  responsive = false,
  responsiveHeight = 250,
  CustomTooltip = undefined,
}: Props<Axis, Types>) {
  const theme: any = useTheme()

  const renderAreaChart = () => {
    return (
      <AreaChart data={values} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid
          vertical={verticalAxisLines}
          strokeDasharray="12 3"
          stroke="#e6e6e6" /* dot={{strokeWidth: 4}} */
        />
        <XAxis tick={{ fontSize: 11 }} dataKey={xAxis} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          // eslint-disable-next-line standard/object-curly-even-spacing
          cursor={{ stroke: 'rgba(96, 96, 96, 0.5)', strokeDasharray: '6' /* strokeWidth: 6 */ }}
          content={CustomTooltip}
        />
        {keys.map(({ name, color }) => (
          <Area
            key={name}
            type="monotone"
            dataKey={name}
            stackId="1"
            stroke={pathStr(color, theme.palette)}
            strokeWidth={2}
            fill={pathStr(color, theme.palette)}
            activeDot={{ strokeWidth: 4, r: 8, stroke: 'rgba(96, 96, 96, 0.5)' }}
          />
        ))}
      </AreaChart>
    )
  }

  return responsive ? (
    <ResponsiveContainer width="100%" height={responsiveHeight}>
      {renderAreaChart()}
    </ResponsiveContainer>
  ) : (
    <div>{renderAreaChart()}</div>
  )
}

export default StackedAreaChart
