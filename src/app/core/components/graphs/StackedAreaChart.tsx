import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
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
}

// types should be a list of strings that also show up in AreaChartEntry as a property
interface Props<T extends string, V extends string> {
  values: Array<AreaChartEntry<T, V>>
  width?: number
  height?: number
  xAxis: T
  keys: Array<AreaChartType<V>>
  responsive?: boolean
}

// Todo: Instead of a set width and height, also allow for percents
function StackedAreaChart<Axis extends string, Types extends string>({
  values,
  width = 600,
  height = 400,
  keys,
  xAxis,
  responsive = false,
}: Props<Axis, Types>) {
  const theme: any = useTheme()

  return responsive ? (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart
        data={values}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxis} />
        <YAxis />
        <Tooltip />
        {keys.map(({ name, color }) => (
          <Area
            key={name}
            type="monotone"
            dataKey={name}
            stackId="1"
            stroke={pathStr(color, theme.palette)}
            fill={pathStr(color, theme.palette)}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  ) : (
    <AreaChart
      width={width}
      height={height}
      data={values}
      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xAxis} />
      <YAxis />
      <Tooltip />
      {keys.map(({ name, color }) => (
        <Area
          key={name}
          type="monotone"
          dataKey={name}
          stackId="1"
          stroke={pathStr(color, theme.palette)}
          fill={pathStr(color, theme.palette)}
        />
      ))}
    </AreaChart>
  )
}

export default StackedAreaChart
