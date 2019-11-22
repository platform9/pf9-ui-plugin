// Libs
import React, { FunctionComponent } from 'react'
import { Link } from 'react-router-dom'
// Hooks
import { makeStyles } from '@material-ui/styles'
import useDataLoader from 'core/hooks/useDataLoader'
// Components
import { Typography, CircularProgress } from '@material-ui/core'
import { hexToRGBA } from 'core/utils/colorHelpers'

const useStyles = makeStyles((theme: any) => ({
  headerIcon: {
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#243748',
    width: '12rem',
    height: '7.25rem',
    margin: theme.spacing(1),
    padding: `${theme.spacing(1.5)}px ${theme.spacing(1.5)}px ${theme.spacing(0.5)}px ${theme.spacing(1.5)}px`,
    borderRadius: '5px',
    transition: 'transform .1s ease',
    '&:hover': {
      backgroundColor: hexToRGBA('#243748', 0.95),
      transform: 'scale(1.025)'
    }
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    marginBottom: theme.spacing(1),
    alignItems: 'center',
    flex: 1,
  },
  text: {
    color: theme.palette.secondary.contrastText, // white
    marginLeft: '1px',
  },
  cardTitle: {
    marginLeft: theme.spacing(1),
    fontWeight: 400,
    color: theme.palette.secondary.contrastText, // white
  },
  failedText: {
    color: theme.palette.error.light,
    marginLeft: theme.spacing(2),
  },
  pendingText: {
    color: '#FEC35D',
    marginLeft: theme.spacing(2),
  },
}))

type PropertyFunction<T> = (p: any) => T

interface StatusCardProps {
  route: string
  title: string
  icon: string | PropertyFunction<JSX.Element>
  quantity: number
  dataLoader: [() => any, {}] // todo figure out typings here.
  quantityFn(data: any[]): { quantity: number, working: number, pending: number }
}

const StatusCard: FunctionComponent<StatusCardProps> = ({ route, title, icon: Icon, dataLoader, quantityFn }) => {
  const { row, contentContainer, headerIcon, cardTitle } = useStyles({})
  const [data, loading] = useDataLoader(...dataLoader)
  const { quantity, working, pending = 0 } = quantityFn(data)
  const failed = quantity - (working + pending)
  const iconComponent =
    typeof Icon === 'string' ? (
      <img className={headerIcon} alt="" src={Icon} />
    ) : (
      <Icon className={headerIcon} color="primary" />
    )
  return (
    <Link to={route}>
      <div className={contentContainer}>
        <div className={row}>
          {iconComponent}
          <Typography variant="h6" className={cardTitle}>
            {title}
          </Typography>
        </div>
        {loading ? (
          <div className={row}>
            <CircularProgress size={32} />
          </div>
        ) : (
          <CardDetails quantity={quantity} pending={pending} failed={failed} />
        )}
      </div>
    </Link>
  )
}

export default StatusCard

interface CardDetailsProps {
  quantity: number
  failed: number
  pending: number
}
const CardDetails: FunctionComponent<CardDetailsProps> = ({ quantity, failed, pending }) => {
  const { row, failedText, pendingText, text } = useStyles({})
  return (
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
  )
}
