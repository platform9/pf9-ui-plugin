// Data is sent to Segment using window.analytics

// name & body are both optional
const segmentPage = (name, body) => {
  if (!window.analytics) { return }
  window.analytics.page(name, body)
}

const track = (type, data) => {
  if (type === 'pageLoad') {
    segmentPage(data.route)
  }
}

export default track
