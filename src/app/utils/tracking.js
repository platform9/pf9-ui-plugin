// Data is sent to Segment using window.analytics

// name & body are both optional
const segmentPage = (name, body = {}) => {
  window.analytics.page(name, body)
}

const segmentEvent = (name, body = {}) => {
  window.analytics.track(name, body)
}

const track = (type, data) => {
  if (!window.analytics) { return }
  if (type === 'pageLoad') {
    segmentPage(data.route)
  } else if (type === 'event') {
    segmentEvent(data.eventName, data.eventProperties)
  }
}

export default track
