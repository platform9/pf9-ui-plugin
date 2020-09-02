import { Route } from 'core/utils/routes'

// Data is sent to Segment using window.analytics

// name & body are both optional for both page & event
export const trackPage = (location, body = {}) => {
  // TODO @john fix the location string thats passed to Route.find()
  const route = Route.find(location.pathname + location.hash)
  if (window.analytics && route) {
    return window.analytics.page(route.name)
  }
  console.info(`No route found for '${location}'.  Consider adding route to 'routes.ts'.`)
}

export const trackEvent = (name, body = {}) => {
  if (!window.analytics) {
    return
  }
  window.analytics.track(name, body)
}

export const injectDrift = () => {
  const existingScript = document.getElementById('driftCode')
  if (existingScript) return
  const script = document.createElement('script')
  script.id = 'driftCode'
  script.textContent = `
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
  document.body.appendChild(script)
}
