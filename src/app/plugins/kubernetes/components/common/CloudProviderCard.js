import React from 'react'
import PropTypes from 'prop-types'
import useReactRouter from 'use-react-router'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles((theme) => ({
  root: {
    filter: ({ disabled }) => (disabled ? 'grayscale(100%)' : null),
    opacity: ({ disabled }) => (disabled ? 0.7 : 1),
    margin: theme.spacing(1, 1.5),
    padding: theme.spacing(1.5, 0, .5, 0),
    userSelect: 'none',
    textAlign: 'center',
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: ({ disabled }) => (disabled ? 'default' : 'pointer'),
    border: ({ active }) => (active ? `1px solid ${theme.palette.blue[500]}` : `1px solid transparent`),
    borderRadius: 4,
    backgroundColor: ({ active }) => (active ? theme.palette.blue[100] : theme.palette.grey['000']),
    width: 240,
    height: 124,
    '& img': {
      maxWidth: 160,
      maxHeight: 100,
      width: '100%',
    },
    '&:hover': {
      // margin: ({ disabled }) => (!disabled ? 0 : 1),
      border: ({ disabled }) => (!disabled ? '1px solid #4aa3df' : '1px solid #999'),
    },
  },
  // logoContainer: {
  //   display: 'flex',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   width: 132,
  //   height: 82,
  //   margin: ({ active }) => (active ? 0 : 1),
  //   border: ({ active }) => (active ? '2px solid #4aa3df' : '1px solid #999'),
  //   borderRadius: 10,
  //   backgroundColor: '#FFF',
  //   '& img': {
  //     maxWidth: 100,
  //     maxHeight: 60,
  //   },
  //   '&:hover': {
  //     margin: ({ disabled }) => (!disabled ? 0 : 1),
  //     border: ({ disabled }) => (!disabled ? '2px solid #4aa3df' : '1px solid #999'),
  //   },
  // },
  label: {
    marginTop: theme.spacing(1),
    color: theme.palette.grey[700],
  },
}))

const iconSizes = { small: '', medium: '@2x', large: '@3x' }
const iconSize = iconSizes.small
const rootPath = '/ui/images/icon-cloudproviders'
const icons = {
  aws: `${rootPath}/cloudaws-default${iconSize}.png`,
  azure: `${rootPath}/cloudazure-default${iconSize}.png`,
  openstack: `${rootPath}/icon-cloudproviders-openstack${iconSize}.png`,
  vmware: `${rootPath}/icon-cloudproviders-vmware${iconSize}.png`,
  // local: `${rootPath}/icon-cloudproviders-other${iconSize}.png`,
  local: `${rootPath}/bare-metal.svg`,
}

const labels = {
  aws: 'Amazon AWS',
  azure: 'Microsoft Azure',
  openstack: 'OpenStack',
  vmware: 'VMware',
  local: 'Bare OS',
}

const CloudProviderCard = (props) => {
  const { type, disabled, image = icons[type], label = labels[type], src, onClick } = props
  const classes = useStyles(props)
  const { history } = useReactRouter()
  const handleClick = () => {
    if (disabled) return
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

CloudProviderCard.propTypes = {
  type: PropTypes.oneOf(['aws', 'azure', 'openstack', 'vmware', 'local']).isRequired,
  src: PropTypes.string,
  onClick: PropTypes.func,
  // eslint-disable-next-line react/no-unused-prop-types
  active: PropTypes.bool,
  image: PropTypes.string,
  label: PropTypes.string,
  disabled: PropTypes.bool,
}

export default CloudProviderCard
