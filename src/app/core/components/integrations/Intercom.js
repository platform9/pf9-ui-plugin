import React, { useContext, useMemo } from 'react'
import { AppContext } from 'core/providers/AppProvider'
import BaseIntercom from 'react-intercom'

const Intercom = () => {
  const { session: { username } } = useContext(AppContext)
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
  return <BaseIntercom {...options} />
}

export default Intercom
