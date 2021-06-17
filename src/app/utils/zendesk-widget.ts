import axios from 'axios'
import { DocumentMetaCls } from 'core/components/DocumentMeta'

const zendeskScriptUrl =
  'https://static.zdassets.com/ekr/snippet.js?key=5d4d85e0-ef42-4308-8aad-70a4a0a92b0d'
const jwtTokenEndpoint = 'https://cs.pf9.us/support/zd/widget-auth'
const authErrorMsg = 'Error authenticating Zendesk widget: '

interface IWindow extends Window {
  zE: any
  zESettings: any
}
declare var window: IWindow

export const showZendeskWidget = () => {
  if (!window.zE) {
    return
  }
  window.zE('webWidget', 'show')
}

export const hideZendeskWidget = () => {
  if (!window.zE) {
    return
  }
  window.zE('webWidget', 'hide')
}

export const openZendeskWidget = () => {
  if (!window.zE) {
    return
  }
  window.zE('webWidget', 'open')
}

export const showAndOpenZendeskWidget = () => {
  showZendeskWidget()
  openZendeskWidget()
}

const zendeskIdentifyUser = (displayName, email) => {
  if (!window.zE) {
    return
  }
  window.zE('webWidget', 'identify', {
    name: displayName,
    email,
  })
}

const reauthenticateZendeskUser = ({ displayName, email, zeSettings }) => {
  if (!window.zE) {
    return
  }
  // Re-identify the user
  zendeskIdentifyUser(displayName, email)

  // Update widget settings
  window.zE('webWidget', 'updateSettings', zeSettings)

  // Re-authenticate the user
  window.zE('webWidget', 'chat:reauthenticate')
}

/**
 * Adds the Zendesk widget script to the DOM body. If script already exists,
 * update the zeSettings with the new user info and re-identify and re-authenticate the user
 */
export const addZendeskWidgetScriptToDomBody = ({ userId, displayName, email }) => {
  const userData = {
    name: displayName,
    email: email,
    iat: Math.round(new Date().getTime() / 1000),
    external_id: userId,
  }

  // Specify the widget settings before adding the script
  const zeSettings = {
    analytics: true,
    answerBot: {
      contactOnlyAfterQuery: true,
    },
    webWidget: {
      authenticate: {
        chat: {
          jwtFn: async (callback) => {
            try {
              const response = await axios.post(jwtTokenEndpoint, userData, {
                headers: { 'Content-Type': 'application/json' },
              })
              if (response.status !== 200) {
                throw response.statusText
              } else {
                const jwt = response.data
                callback(jwt)
              }
            } catch (err) {
              console.error(authErrorMsg + err)
            }
          },
        },
      },
    },
  }

  // If Zendesk script already exists, re-identify and reauthenticate the user
  const existingScript = document.getElementById('ze-snippet')
  if (existingScript) {
    reauthenticateZendeskUser({ displayName, email, zeSettings })
    return
  }

  window.zESettings = zeSettings

  const onload = () => {
    if (!window.zE) {
      return
    }
    hideZendeskWidget()
    zendeskIdentifyUser(displayName, email)
    window.zE('webWidget:on', 'open', () => window.zE('webWidget', 'show'))
    window.zE('webWidget:on', 'close', () => window.zE('webWidget', 'hide'))
  }

  DocumentMetaCls.addScriptElementToDomBody({
    id: 'ze-snippet',
    src: zendeskScriptUrl,
    onload,
  })
}
