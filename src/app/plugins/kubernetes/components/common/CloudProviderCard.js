import React from 'react'
import PropTypes from 'prop-types'
import useReactRouter from 'use-react-router'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(1, 3),
    userSelect: 'none',
    textAlign: 'center',
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    cursor: 'pointer',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 132,
    height: 82,
    margin: ({ active }) => active ? 0 : 1,
    border: ({ active }) => active ? '2px solid #4aa3df' : '1px solid #999',
    borderRadius: 10,
    backgroundColor: '#FFF',
    '& img': {
      maxWidth: 100,
      maxHeight: 60,
    },
    '&:hover': {
      margin: 0,
      border: '2px solid #4aa3df',
    },
  },
  label: {
    marginTop: theme.spacing(1),
  },
}))

const iconSizes = { small: '', medium: '@2x', large: '@3x' }
const iconSize = iconSizes.small
const rootPath = '/ui/images/icon-cloudproviders'
const icons = {
  aws: `${rootPath}/icon-cloudproviders-aws${iconSize}.png`,
  azure: `${rootPath}/icon-cloudproviders-azure${iconSize}.png`,
  openstack: `${rootPath}/icon-cloudproviders-openstack${iconSize}.png`,
  vmware: `${rootPath}/icon-cloudproviders-vmware${iconSize}.png`,
  other: `${rootPath}/icon-cloudproviders-other${iconSize}.png`,
}

const labels = {
  aws: 'Amazon AWS Provider',
  azure: 'Microsoft Azure',
  openstack: 'OpenStack',
  vmware: 'VMware',
  other: 'Bare OS',
}

const CloudProviderCard = ({ type, image = icons[type], label = labels[type], src, onClick, ...rest }) => {
  const classes = useStyles(rest)
  const { history } = useReactRouter()
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      history.push(src)
    }
  }
  return <div className={classes.root} onClick={handleClick}>
    <div className={classes.logoContainer}><img src={image} /></div>
    <Typography className={classes.label} variant="subtitle2">{label}</Typography>
  </div>
}

CloudProviderCard.propTypes = {
  type: PropTypes.oneOf(['aws', 'azure', 'openstack', 'vmware', 'other']).isRequired,
  src: PropTypes.string,
  onClick: PropTypes.func,
  active: PropTypes.bool,
  image: PropTypes.string,
  label: PropTypes.string,
}

export default CloudProviderCard
