import React from 'react'
import { compose } from 'app/utils/fp'
import requiresAuthentication from 'openstack/util/requiresAuthentication'

const OnboardingPage = () => {
  // Todo: Change wizard depending on which step they are on
  return <div />
}

export default compose(requiresAuthentication)(OnboardingPage)
