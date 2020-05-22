import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { useTheme } from '@material-ui/core/styles'
import { pathStr } from 'utils/fp'
import { makeStyles } from '@material-ui/styles'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { Theme } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) => ({
  customTooltip: {
    background: '#ffffff',
    padding: theme.spacing(1),
    fontSize: 13,
    minWidth: 144,
  },
  customTooltipHeader: {
    borderBottom: '1px solid #d8d8d8',
    padding: theme.spacing(1),
  },
  customTooltipBody: {
    paddingTop: theme.spacing(2),
  },
  customTooltipEntry: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  customTooltipLabel: {
    flexGrow: 0,
  },
  customTooltipName: {
    marginLeft: theme.spacing(1)
  },
  customTooltipCount: {
    flexGrow: 0,
    paddingRight: theme.spacing(1)
  },
}))

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
  verticalAxisLines?: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: any
  label?: string
  keys: any[]
}

// Should the Label and Entries be passed in as a prop?
const CustomTooltip = ({ active, payload, label, keys }: CustomTooltipProps) => {
  const classes = useStyles({})
  const theme: any = useTheme()

  if (active && payload) {
    // Need data from both payload (count) & keys (icon, color)
    const countByKey = payload.reduce((acc, value) => {
      acc[value.name] = value.payload[value.name]
      return acc
    }, {})

    return (
      <div className={classes.customTooltip}>
        <div className={classes.customTooltipHeader}>
          Alarms @ {label}
        </div>
        <div className={classes.customTooltipBody}>
          {keys.map(({ name, color, icon }) => (
            <div key={name} className={classes.customTooltipEntry}>
              <div className={classes.customTooltipLabel}>
                <FontAwesomeIcon solid style={{color: pathStr(color, theme.palette)}}>{icon}</FontAwesomeIcon>
                <span className={classes.customTooltipName}>{name}</span>
              </div>
              <div className={classes.customTooltipCount}>{countByKey[name]}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
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
}: Props<Axis, Types>) {
  const theme: any = useTheme()

  const renderAreaChart = () => {
    return (
      <AreaChart
        data={values}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={verticalAxisLines} strokeDasharray="12 3" stroke="#e6e6e6" dot={{strokeWidth: 4}} />
        <XAxis tick={{fontSize: 11}} dataKey={xAxis} />
        <YAxis tick={{fontSize: 11}} />
        <Tooltip content={<CustomTooltip keys={keys} />} cursor={{stroke: 'rgba(96, 96, 96, 0.5)', strokeWidth: 6}} />
        {keys.map(({ name, color }) => (
          <Area
            key={name}
            type="monotone"
            dataKey={name}
            stackId="1"
            stroke={pathStr(color, theme.palette)}
            strokeWidth={2}
            fill={pathStr(color, theme.palette)}
            activeDot={{strokeWidth: 4, r: 8, stroke: "rgba(96, 96, 96, 0.5)"}}
          />
        ))}
      </AreaChart>
    )
  }

  return responsive ? (
    <ResponsiveContainer width="100%" height={250}>
      {renderAreaChart()}
    </ResponsiveContainer>
  ) : (
    <div>
      {renderAreaChart()}
    </div>
  )
}

export default StackedAreaChart
