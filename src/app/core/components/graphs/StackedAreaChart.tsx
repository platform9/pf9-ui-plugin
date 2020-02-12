import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useTheme } from '@material-ui/core/styles'
import { path } from 'ramda'

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
    data={exampleData}
    types={exampleTypes}
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
  data: Array<AreaChartEntry<T, V>>
  width?: number
  height?: number
  xAxis: T
  types: Array<AreaChartType<V>>
}

// Todo: Instead of a set width and height, also allow for percents
function StackedAreaChart<Axis extends string, Types extends string>({
  data,
  width = 600,
  height = 400,
  types,
  xAxis,
  ...rest
}: Props<Axis, Types>) {
  const theme: any = useTheme()

  return (
    <AreaChart
      width={width}
      height={height}
      data={data}
      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xAxis} />
      <YAxis />
      <Tooltip />
      {types.map(({ name, color }) => (
        <Area
          key={name}
          type="monotone"
          dataKey={name}
          stackId="1"
          stroke={path(color.split('.'), theme.palette)}
          fill={path(color.split('.'), theme.palette)}
        />
      ))}
    </AreaChart>
  )
}

export default StackedAreaChart
