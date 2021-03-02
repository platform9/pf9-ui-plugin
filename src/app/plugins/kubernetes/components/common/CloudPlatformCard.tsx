import React, { FC } from 'react'
import useReactRouter from 'use-react-router'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import { ClusterCloudPlatforms } from 'app/constants'

const useStyles = makeStyles<Theme, Props>((theme) => ({
  root: {
    filter: ({ disabled }) => (disabled ? 'grayscale(100%)' : null),
    opacity: ({ disabled }) => (disabled ? 0.7 : 1),
    padding: theme.spacing(1.5, 0, 0.5, 0),
    userSelect: 'none',
    textAlign: 'center',
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: ({ disabled }) => (disabled ? 'default' : 'pointer'),
    border: ({ active }) =>
      active ? `1px solid ${theme.palette.blue[500]}` : `1px solid transparent`,
    borderRadius: 4,
    backgroundColor: ({ active }) => (active ? theme.palette.blue[100] : theme.palette.grey['000']),
    width: 240,
    height: 124,
    '& img': {
      maxWidth: 160,
      maxHeight: 100,
    },
    '&:hover': {
      // margin: ({ disabled }) => (!disabled ? 0 : 1),
      border: ({ disabled }) => (!disabled ? '1px solid #4aa3df' : '1px solid #999'),
    },
  },
  label: {
    marginTop: theme.spacing(1),
    color: theme.palette.grey[700],
  },
}))

const iconSizes = { small: '', medium: '@2x', large: '@3x' }
const iconSize = iconSizes.small
const rootPath = '/ui/images/icon-cloudproviders'
const icons = {
  [ClusterCloudPlatforms.EKS]: `${rootPath}/cloudaws-default${iconSize}.png`,
  [ClusterCloudPlatforms.AKS]: `${rootPath}/cloudazure-default${iconSize}.png`,
  // Google icons different size than the others
  [ClusterCloudPlatforms.GKE]: `${rootPath}/cloudgoogle-default${iconSizes.medium}.png`,
}

const labels = {
  [ClusterCloudPlatforms.EKS]: 'EKS Cluster',
  [ClusterCloudPlatforms.AKS]: 'AKS Cluster',
  [ClusterCloudPlatforms.GKE]: 'GKE Cluster',
}

const CloudPlatformCard: FC<Props> = (props) => {
  const { type, disabled, image = icons[type], label = labels[type], src, onClick, active } = props
  const classes = useStyles(props)
  const { history } = useReactRouter()
  const handleClick = () => {
    if (disabled || active) return
    if (onClick) return onClick(type)
    history.push(src)
  }
  return (
    <div className={classes.root} onClick={handleClick}>
      <div className={classes.logoContainer}>
        <img alt={type} src={image} />
      </div>
      <Text className={classes.label} variant="caption4">
        {label}
      </Text>
    </div>
  )
}

interface Props {
  type: ClusterCloudPlatforms
  src?: string
  onClick?: (type: ClusterCloudPlatforms) => any
  active?: boolean
  image?: string
  label?: string
  disabled?: boolean
}

export default CloudPlatformCard
