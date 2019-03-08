import React from 'react'
import { withAppContext } from 'core/AppContext'
import BaseIntercom from 'react-intercom'

const Intercom = ({ context: { session } }) => {
  const options = {
    appID: 'vk6p8zue',
    email: session.username,
    created_at: 1312182000, // Keystone does not provide user create time so just put whatever
    name: session.username,
    domain: document.domain,
    user_id: session.username,
    pf9_role: 'TODO', // We don't have this information yet in the session.
    widget: { activator: '#IntercomDefaultWidget' },
  }
  return <BaseIntercom {...options} />
}

export default withAppContext(Intercom)
