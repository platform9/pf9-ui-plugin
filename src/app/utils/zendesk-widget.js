import axios from 'axios'
import { DocumentMetaCls } from 'core/components/DocumentMeta'

const zendeskScriptUrl =
  'https://static.zdassets.com/ekr/snippet.js?key=5d4d85e0-ef42-4308-8aad-70a4a0a92b0d'
const jwtTokenEndpoint = 'https://cs.pf9.us/support/zd/widget-auth'
const authErrorMsg = 'Error authenticating Zendesk widget: '

export const showZendeskWidget = () => {
  if (window.zE) {
    zE('webWidget', 'show')
  }
}

export const hideZendeskWidget = () => {
  if (window.zE) {
    zE('webWidget', 'hide')
  }
}

export const openZendeskWidget = () => {
  if (window.zE) {
    zE('webWidget', 'open')
  }
}

export const showAndOpenZendeskWidget = () => {
  showZendeskWidget()
  openZendeskWidget()
}

const zendeskIdentifyUser = (displayName, email) => {
  if (window.zE) {
    zE('webWidget', 'identify', {
      name: displayName,
      email,
    })
  }
}

const reauthenticateZendeskUser = ({ displayName, email, zeSettings }) => {
  // Re-identify the user
  zendeskIdentifyUser(displayName, email)

  if (window.zE) {
    // Update widget settings
    zE('webWidget', 'updateSettings', zeSettings)

    // Re-authenticate the user
    zE('webWidget', 'chat:reauthenticate')
  }
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
    hideZendeskWidget()
    zendeskIdentifyUser(displayName, email)
    if (window.zE) {
      zE('webWidget:on', 'open', () => zE('webWidget', 'show'))
      zE('webWidget:on', 'close', () => zE('webWidget', 'hide'))
    }
  }

  DocumentMetaCls.addScriptElementToDomBody({
    id: 'ze-snippet',
    src: zendeskScriptUrl,
    onload,
  })
}
