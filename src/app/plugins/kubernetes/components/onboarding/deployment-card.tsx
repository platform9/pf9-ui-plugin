import React, { FC } from 'react'
import useReactRouter from 'use-react-router'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import clsx from 'clsx'

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    opacity: 1,
    padding: theme.spacing(1.5, 0, 0.5, 0),
    userSelect: 'none',
    textAlign: 'center',
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: `1px solid ${theme.palette.primary}`,
    borderRadius: 4,
    backgroundColor: theme.palette.grey['000'],
    width: 'max-content',
    height: 124,
    '& img': {
      maxWidth: 160,
      maxHeight: 100,
    },
    '&:hover': {
      border: '1px solid #999',
    },
  },
  imagesContainer: {
    display: 'flex',
  },
  label: {
    marginTop: theme.spacing(1),
    color: theme.palette.grey[700],
  },
}))

const rootPath = '/ui/images/icon-cloudproviders'

const images = {
  virtualMachine: { alt: 'Virtual Machine', src: `${rootPath}/vm-default.png` },
  physicalMachine: { alt: 'Physical Machine', src: `${rootPath}/physical-default.png` },
  azure: { alt: 'Azure', src: `${rootPath}/cloudazure-default.png` },
  aws: {
    alt: 'AWS',
    src: `${rootPath}/cloudaws-default.png`,
  },
  gke: { alt: 'GKE', src: `${rootPath}/cloudgoogle-default@2x.png` },
  aks: { alt: 'AKS', src: `${rootPath}/cloudazure-default.png` },
  eks: { alt: 'EKS', src: `${rootPath}/cloudaws-default.png` },
}

const DeploymentCard: FC<Props> = (props) => {
  const { type, imageNames, label, src, onClick, className } = props
  const classes = useStyles()
  const { history } = useReactRouter()
  const handleClick = () => {
    if (onClick) return onClick(type)
    history.push(src)
  }
  return (
    <div className={clsx(classes.root, className)} onClick={handleClick}>
      <div className={classes.imagesContainer}>
        {imageNames.map((name) => (
          <img key={name} alt={images[name]?.alt} src={images[name]?.src} />
        ))}
      </div>
      <Text className={classes.label} variant="caption4">
        {label}
      </Text>
    </div>
  )
}

interface Props {
  type: string
  src?: string
  onClick?: (type) => any
  active?: boolean
  imageNames: string[]
  label?: string
  disabled?: boolean
  className?: any
}

export default DeploymentCard
