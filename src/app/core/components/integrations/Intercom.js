import React, { useMemo } from 'react'
import BaseIntercom from 'react-intercom'
import { useSelector } from 'react-redux'
import { prop } from 'ramda'
import { sessionStoreKey } from 'core/session/sessionReducers'

const Intercom = () => {
  const session = useSelector(prop(sessionStoreKey))
  const { username } = session
  const options = useMemo(() => ({
    appID: 'vk6p8zue',
    email: username,
    created_at: 1312182000, // Keystone does not provide user create time so just put whatever
    name: username,
    domain: document.domain,
    user_id: username,
    pf9_role: 'TODO', // We don't have this information yet in the session.
    widget: { activator: '#IntercomDefaultWidget' },
  }), [username])
  return username ? <BaseIntercom {...options} /> : null
}

export default Intercom
