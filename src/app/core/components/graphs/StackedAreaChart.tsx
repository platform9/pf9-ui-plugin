import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useTheme } from '@material-ui/core/styles'
import { path } from 'ramda'

// Usage:
// const exampleData = [
//   {
//     time: '8:00',
//     warning: 5,
//     critical: 10,
//     fatal: 15,
//   },
//   ...
// ]

// const exampleTypes = [
//   {
//     name: 'warning',
//     color: 'warning',
//   },
//   ...
// ]

// const exampleAxis = 'time'

export interface AreaChartEntry {
  [propName: string]: any
}

export interface AreaChartType {
  name: string
  color: string
}

// types should be a list of strings that also show up in AreaChartEntry as a property
interface Props {
  data: AreaChartEntry[]
  width: number
  height: number
  xAxis: string
  types: AreaChartType[]
}

// Todo: Instead of a set width and height, also allow for percents
const StackedAreaChart = ({ data, width=600, height=400, types, xAxis, ...rest }: Props) => {
  const theme: any = useTheme()

  return (
    <AreaChart width={width} height={height} data={data} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
      <CartesianGrid strokeDasharray="3 3"/>
      <XAxis dataKey={xAxis}/>
      <YAxis/>
      <Tooltip/>
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
