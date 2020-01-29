import React, { FC } from 'react'
import BannerContent from 'core/components/notifications/BannerContent'

// const useStyles = makeStyles<Theme>(theme => ({
//   content: {
//     height: 30,
//     display: 'flex',
//     flexFlow: 'row nowrap',
//     textAlign: 'center',
//     color: theme.palette.secondary.contrastText,
//     justifyContent: 'center',
//     width: '100%',
//     backgroundColor: '#F5A623',
//   },
//   icon: {
//     fontSize: 20,
//   },
//   iconVariant: {
//     opacity: 0.9,
//     marginRight: theme.spacing(1),
//   },
//   message: {
//     display: 'flex',
//     alignItems: 'center',
//   },
//   text: {
//     display: 'inline-block',
//   },
//   close: {
//     position: 'absolute',
//     right: 0,
//   },
// }))

const OnboardingBanner: FC = props => {
  return <BannerContent>
    Welcome to Platform9
  </BannerContent>
}

export default OnboardingBanner
