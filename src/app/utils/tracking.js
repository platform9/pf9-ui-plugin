import { Route } from 'core/utils/routes'
import Bugsnag from '@bugsnag/js'

// Data is sent to Segment using window.analytics

// name & body are both optional for both page & event
export const trackPage = (location) => {
  const route = Route.find(location)
  if (!route) {
    console.info(`No route found for '${location}'. Consider registering it as a Route.`)
  }

  // Tracking for Segment
  if (window.analytics) {
    window.analytics.page(route.name)
  }

  Bugsnag.leaveBreadcrumb(route.name, {}, 'navigation')
}

export const trackEvent = (name, body = {}) => {
  if (!window.analytics) {
    return
  }

  window.analytics.track(name, body)
}

export const segmentScriptContent = `
"use strict";
!(function() {
  var analytics = (window.analytics = window.analytics || [])
  if (!analytics.initialize)
    if (analytics.invoked)
      window.console && console.error && console.error('Segment snippet included twice.')
    else {
      analytics.invoked = !0
      analytics.methods = [
        'trackSubmit',
        'trackClick',
        'trackLink',
        'trackForm',
        'pageview',
        'identify',
        'reset',
        'group',
        'track',
        'ready',
        'alias',
        'debug',
        'page',
        'once',
        'off',
        'on',
      ]
      analytics.factory = function(t) {
        return function() {
          var e = Array.prototype.slice.call(arguments)
          e.unshift(t)
          analytics.push(e)
          return analytics
        }
      }
      for (var t = 0; t < analytics.methods.length; t++) {
        var e = analytics.methods[t]
        analytics[e] = analytics.factory(e)
      }
      analytics.load = function(t, e) {
        var n = document.createElement('script')
        n.type = 'text/javascript'
        n.async = !0
        n.src = 'https://cdn.segment.com/analytics.js/v1/' + t + '/analytics.min.js'
        var a = document.getElementsByTagName('script')[0]
        a.parentNode.insertBefore(n, a)
        analytics._loadOptions = e
      }
      analytics.SNIPPET_VERSION = '4.1.0'
      analytics.load('CZyWxMIN8qYscIAIOEHJE1ZITYDAQIhU')
    }
})()
`

export const driftScriptContent = `
"use strict";
!function() {
var t = window.driftt = window.drift = window.driftt || [];
if (!t.init) {
if (t.invoked) return void (window.console && console.error && console.error("Drift snippet included twice."));
t.invoked = !0, t.methods = [ "identify", "config", "track", "reset", "debug", "show", "ping", "page", "hide", "off", "on" ],
t.factory = function(e) {
return function() {
var n = Array.prototype.slice.call(arguments);
return n.unshift(e), t.push , t;
};
}, t.methods.forEach(function(e) {
t[e] = t.factory(e);
}), t.load = function(t) {
var e = 3e5, n = Math.ceil(new Date() / e) * e, o = document.createElement("script");
o.type = "text/javascript", o.async = !0, o.crossorigin = "anonymous", o.src = "https://js.driftt.com/include/" + n + "/" + t + ".js";
var i = document.getElementsByTagName("script")[0];
i.parentNode.insertBefore(o, i);
};
}
}();
drift.SNIPPET_VERSION = '0.3.1';
drift.load('ubawwtd8c4gd');
`

export const appCuesSetAnonymous = () => {
  if (window.Appcues) {
    window.Appcues.anonymous()
  }
}
