import React from 'react'
import PieGraph, { PieDataEntry } from 'core/components/graphs/PieGraph'
import { makeStyles } from '@material-ui/styles'
import { useTheme } from '@material-ui/core/styles'
import { Theme } from '@material-ui/core'
import Text from 'core/elements/text'
import { pathStr } from 'utils/fp'
import { formattedName } from 'core/utils/formatters'

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    position: 'relative',
    display: 'flex',
  },
  pieLegend: {
    display: 'flex',
    alignSelf: 'center',
    fontSize: '11px',
    marginLeft: theme.spacing(2),
  },
  legendValue: {
    padding: '3px 8px 3px 0px',
    textAlign: 'right',
  },
  legendName: {
    color: theme.palette.grey[800],
    letterSpacing: '0.8px',
  },
  legendCount: {
    color: theme.palette.grey['000'],
    padding: '0 0 1px 0',
    borderRadius: 25,
    minWidth: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}))

export interface PieUsageWidgetProps {
  primary: string
  sideLength: number
  arcWidth: number
  data: PieDataEntry[]
}

export const PieLegend = ({ data }) => {
  const theme: any = useTheme()
  const classes = useStyles({})
  const { pieLegend, legendValue, legendName } = useStyles({})

  return (
    <div className={pieLegend}>
      <table>
        <tbody>
          {data &&
            data.map((entry) => (
              <tr key={entry.name}>
                <td className={legendValue}>
                  <Text
                    variant="caption1"
                    className={classes.legendCount}
                    style={{ backgroundColor: pathStr(entry.color, theme.palette) }}
                  >
                    {entry.value}
                  </Text>
                </td>
                <td>
                  <Text variant="body2" className={legendName}>
                    {formattedName(entry.name)}
                  </Text>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

const PieUsageWidget = ({
  primary,
  data,
  sideLength = 110,
  arcWidth = 12,
  ...rest
}: PieUsageWidgetProps) => {
  const { container } = useStyles({})

  const total = data.reduce((acc, cur) => acc + cur.value, 0)
  const primaryObj = data.find((x) => x.name === primary)
  const primaryNum = primaryObj.value
  const percent = primaryNum / total || 0

  return (
    <div className={container}>
      <PieGraph
        sideLength={sideLength}
        arcWidth={arcWidth}
        data={data}
        percent={percent}
        primary={primary}
        empty={!total}
        {...rest}
      />
      <PieLegend data={data} />
    </div>
  )
}

export default PieUsageWidget
