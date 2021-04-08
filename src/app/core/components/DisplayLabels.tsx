import React from 'react'
import { toPairs as ToPairs } from 'ramda'
import { Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
const toPairs: any = ToPairs

const useStyles = makeStyles((theme: Theme) => ({
  pair: {
    margin: 0,
  },
}))

const DisplayLabels = ({ labels }) => {
  const { pair } = useStyles({})

  return (
    <>
      {toPairs(labels).map(([name, value]) => (
        <p key={name} className={pair}>
          {name}: {value}
        </p>
      ))}
    </>
  )
}

export default DisplayLabels
