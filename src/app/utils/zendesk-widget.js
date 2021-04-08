import axios from 'axios'
import { DocumentMetaCls } from 'core/components/DocumentMeta'

const zendeskScriptUrl =
  'https://static.zdassets.com/ekr/snippet.js?key=5d4d85e0-ef42-4308-8aad-70a4a0a92b0d'
const jwtTokenEndpoint = 'https://cs.pf9.us/support/zd/widget-auth'
const authErrorMsg = 'Error authenticating Zendesk widget: '

export const addZendeskWidgetScriptToDomBody = ({ userId, displayName, email }) => {
  if (window.zE) {
    window.zE('webWidget', 'show')
    return
  }

  // const existingScript = document.getElementById('zendesk-action')
  // if (existingScript) {
  //   DocumentMetaCls.removeScriptElementFromDomBody('zendesk-action')
  // }
  // const script = document.createElement('script')
  // script.id = 'zendesk-action'
  // script.textContent = `if (zE) {zE('webWidget', 'show')}`
  // script.type = 'text/javascript'
  // document.body.appendChild(script)

  const onload = () => {
    window.zE('webWidget', 'identify', {
      name: displayName,
      email,
    })
  }

  const userData = {
    name: displayName,
    email: email,
    iat: Math.round(new Date().getTime() / 1000),
    external_id: userId,
  }

  window.zESettings = {
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
              console.warn(authErrorMsg + err)
            }
          },
        },
      },
    },
  }

  DocumentMetaCls.addScriptElementToDomBody({ id: 'ze-snippet', src: zendeskScriptUrl, onload })
}

export const hideZendeskWidget = () => {
  if (window.zE) {
    window.zE('webWidget', 'hide')
  }

  // const zendeskScript = document.getElementById('ze-snippet')
  // if (!zendeskScript) return

  // const existingScript = document.getElementById('zendesk-action')
  // if (existingScript) {
  //   DocumentMetaCls.removeScriptElementFromDomBody('zendesk-action')
  // }
  const script = document.createElement('script')
  script.id = 'zendesk-action'
  script.textContent = `if (zE) {zE('webWidget', 'hide')}`
  script.type = 'text/javascript'
  document.body.appendChild(script)
}
