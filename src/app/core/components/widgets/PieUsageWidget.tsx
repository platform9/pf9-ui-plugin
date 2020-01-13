import React from 'react'
import PieGraph, { PieDataEntry } from 'core/components/graphs/PieGraph'
import { makeStyles } from '@material-ui/styles'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { useTheme } from '@material-ui/core/styles'
import { Theme } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    position: 'relative',
    display: 'flex'
  },
  pieLegend: {
    display: 'flex',
    alignSelf: 'center',
    fontSize: '11px',
    marginLeft: theme.spacing(2),
  },
  legendCircle: {
    padding: '6px 0px',
  },
  legendValue: {
    padding: '6px 3px',
    textAlign: 'right',
  },
  legendName: {
    padding: '6px',
  }
}))

interface PieUsageWidgetProps {
  primary: string
  sideLength: number
  arcWidth: number
  data: PieDataEntry[]
}

const PieLegend = ({ data }) => {
  const theme: any = useTheme()
  const { pieLegend, legendCircle, legendValue, legendName } = useStyles({})

  return (
    <div className={pieLegend}>
      <table>
        <tbody>
          { data && data.map((entry) => (
            <tr key={entry.name}>
              <td>
                <FontAwesomeIcon
                  solid
                  style={{ color: theme.palette.pieChart[entry.color] }}
                  size="1x"
                  className={legendCircle}
                >circle</FontAwesomeIcon>
              </td>
              <td className={legendValue}>{entry.value}</td>
              <td className={legendName}>{entry.name}</td>
            </tr>
          )) }
        </tbody>
      </table>
    </div>
  )
}

const PieUsageWidget = ({ primary, data, sideLength = 110, arcWidth = 12, ...rest }: PieUsageWidgetProps) => {
  const { container } = useStyles({})

  const total = data.reduce((acc, cur) => (
    acc + cur.value
  ), 0)
  const primaryObj = data.find(x => x.name === primary)
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
