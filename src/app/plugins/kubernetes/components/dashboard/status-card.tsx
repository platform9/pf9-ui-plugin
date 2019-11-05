import * as React from 'react'
import { makeStyles, createStyles } from '@material-ui/styles'
import { Typography, CircularProgress } from '@material-ui/core'
import useDataLoader from '../../../../core/hooks/useDataLoader'
import { Link } from 'react-router-dom'

const useStyles = makeStyles((theme: any) =>
  createStyles({
    headerIcon: {
      width: '2.5rem',
      height: '2.5rem'
    },
    contentContainer: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#243748',
      width: '12rem',
      height: '7.25rem',
      margin: '0.5rem',
      padding: '0.875rem 0.875rem 0.25rem 0.875rem',
      borderRadius: '5px'
    },
    row: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      marginBottom: '0.5rem',
      alignItems: 'center',
      flex: 1
    },
    text: {
      color: theme.palette.secondary.contrastText, // white
      marginLeft: '0.15rem'
    },
    cardTitle: {
      marginLeft: '0.5rem',
      fontWeight: 400,
      color: theme.palette.secondary.contrastText // white
    },
    failedText: {
      color: theme.palette.error.light,
      marginLeft: '1rem',
    },
    pendingText: {
      color: '#FEC35D',
      marginLeft: '1rem',
    }
  })
)

type PropertyFunction<T> = (p: any) => T

interface Props {
  route: string
  title: string
  icon: string | PropertyFunction<JSX.Element>
  quantity: number
  dataLoader: [() => any, {}] // todo figure out typings here.
  quantityFn(
    data: any[]
  ): { quantity: number; working: number; pending: number }
}

export default function StatusCard({
  route,
  title,
  icon: Icon,
  dataLoader,
  quantityFn
}: Props) {
  const {
    row,
    contentContainer,
    headerIcon,
    cardTitle,
    failedText,
    pendingText,
    text
  } = useStyles({})
  const [data, loading] = useDataLoader(...dataLoader)
  const { quantity, working, pending = 0 } = quantityFn(data)
  const failed = quantity - (working + pending)
  const IconComponent =
    typeof Icon === 'string' ? (
      <img className={headerIcon} alt="" src={Icon} />
    ) : (
      <Icon className={headerIcon} color="primary" />
    )
  return (
    <Link to={route}>
    <div className={contentContainer}>
      <div className={row}>
        {IconComponent}
        <Typography variant="h6" className={cardTitle}>
          {title}
        </Typography>
      </div>
      {loading ? (
        <div className={row}><CircularProgress size={32} /></div>
      ) : (
        <div className={row}>
          <Typography className={text} variant="h4">
            {quantity}
          </Typography>
          <div>
          {failed ? (
              <Typography className={failedText} variant="subtitle1">
                {`${failed} failed`}
              </Typography>
            ) : null}
            {pending ? (
              <Typography className={pendingText} variant="subtitle1">
                {`${pending} pending`}
              </Typography>
            ) : null}
          </div>
        </div>
      )}
    </div></Link>
  )
}