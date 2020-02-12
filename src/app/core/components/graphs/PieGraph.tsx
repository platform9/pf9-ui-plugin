import React from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import { useTheme } from '@material-ui/core/styles'
import { pathStr } from 'utils/fp'

export interface PieDataEntry {
  value: number
  name: string
  color: string
}

interface Props {
  data: PieDataEntry[]
  sideLength: number
  arcWidth: number
  percent?: number
  primary?: string
  empty: boolean
}

const emptyData = [{ name: 'empty', value: 1, color: 'empty' }]

const PieGraph = ({
  data,
  sideLength,
  arcWidth,
  percent = undefined,
  primary,
  empty,
  ...rest
}: Props) => {
  const theme: any = useTheme()
  const radius = Math.floor(sideLength / 2)
  const items = empty ? emptyData : data

  return (
    <PieChart width={sideLength + 10} height={sideLength + 10}>
      <Pie
        dataKey="value"
        data={items}
        cx={radius}
        cy={radius}
        innerRadius={radius - arcWidth}
        outerRadius={radius}
        paddingAngle={0}
        {...rest}
      >
        {items.map((entry, index) => (
          <Cell key={entry.name} fill={pathStr(entry.color, theme.palette)} />
        ))}
      </Pie>
      {percent !== undefined && (
        <text
          x={radius + 5}
          y={radius + 5}
          fill={theme.palette.dashboardCard.text}
          fontSize="24px"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      )}
      {primary && (
        <text
          x={radius + 5}
          y={radius + 20}
          fill={theme.palette.dashboardCard.text}
          fontSize="9px"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {primary}
        </text>
      )}
    </PieChart>
  )
}

export default PieGraph
