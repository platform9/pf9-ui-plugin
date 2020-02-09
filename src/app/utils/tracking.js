// Data is sent to Segment using window.analytics

// name & body are both optional for both page & event
export const trackPage = (name, body = {}) => {
  if (!window.analytics) {
    return
  }
  window.analytics.page(name, body)
}

export const trackEvent = (name, body = {}) => {
  if (!window.analytics) {
    return
  }
  window.analytics.track(name, body)
}
