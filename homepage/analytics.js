/* Shared Living Universe analytics — conservative, explicit, non-sensitive.
 * Public statistics are anonymous by default. Returning-browser recognition is opt-in.
 * Google-signed-in family identification requires separate authenticated implementation.
 */
(function () {
  "use strict";
  var OPT_OUT = "wb_analytics_disabled_v1";
  var REMEMBER = "wb_analytics_remember_v1";
  var projectToken = "phc_rck7xFoasJLZGCBbckds7z2k8h63FxZ8uPS6vddYP9Ab";

  function setting(key) {
    try { return window.localStorage.getItem(key) === "yes"; }
    catch (_) { return false; }
  }
  function setSetting(key, value) {
    try { window.localStorage.setItem(key, value ? "yes" : "no"); }
    catch (_) {}
  }
  window.wbAnalyticsPrivacy = {
    isDisabled: function () { return setting(OPT_OUT); },
    remembers: function () { return setting(REMEMBER); },
    optOut: function () {
      setSetting(OPT_OUT, true);
      if (window.posthog && typeof window.posthog.opt_out_capturing === "function") {
        window.posthog.opt_out_capturing();
      }
      window.location.reload();
    },
    optIn: function () {
      setSetting(OPT_OUT, false);
      window.location.reload();
    },
    remember: function (yes) {
      setSetting(REMEMBER, Boolean(yes));
      window.location.reload();
    }
  };
  // Automated builds and local previewing must not contaminate real traffic.
  if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(window.location.hostname)) return;
  if (setting(OPT_OUT)) return;

  function cleanCurrentUrl() {
    var route = /^#\/(sky|world\/[a-z0-9-]{1,64}|convergence|snow-globe)$/.exec(window.location.hash);
    return window.location.origin + window.location.pathname + (route ? route[0] : "");
  }
  function cleanReferrer(value) {
    try { return value ? new URL(value, window.location.origin).origin : ""; }
    catch (_) { return ""; }
  }
  function scrub(event) {
    if (!event || !event.properties) return event;
    var props = event.properties;
    ["$el_text", "$elements_chain", "$search", "$ip", "email", "name", "phone", "address"].forEach(function (key) {
      delete props[key];
    });
    props.$current_url = cleanCurrentUrl();
    props.$pathname = window.location.pathname;
    if (props.$referrer) props.$referrer = cleanReferrer(props.$referrer);
    if (props.$initial_referrer) props.$initial_referrer = cleanReferrer(props.$initial_referrer);
    return event;
  }

  // Loader supplied by the existing, already working site. Do not duplicate per page.
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init(projectToken, {
    api_host: "https://us.i.posthog.com",
    ui_host: "https://us.posthog.com",
    person_profiles: "identified_only",
    // Do not retain a tracking ID across visits without an affirmative opt-in.
    persistence: setting(REMEMBER) ? "localStorage" : "memory",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false,
    disable_session_recording: true,
    mask_all_text: true,
    mask_all_element_attributes: true,
    before_send: scrub
  });
  var allowedKeys = ["world_id", "lens_id", "action", "format", "source", "result"];
  window.wbAnalytics = {
    track: function (name, properties) {
      if (!/^((universe|site|progress)_[a-z0-9_]{1,44})$/.test(name || "")) return;
      var safe = {};
      Object.keys(properties || {}).forEach(function (key) {
        var value = properties[key];
        if (allowedKeys.indexOf(key) >= 0 && typeof value === "string" &&
            /^[a-z0-9_-]{1,64}$/.test(value)) safe[key] = value;
      });
      posthog.capture(name, safe);
    }
  };
  document.addEventListener("click", function (event) {
    var el = event.target && event.target.closest &&
      event.target.closest("[data-analytics]");
    if (!el || el.closest("[data-private], .ph-no-capture")) return;
    var action = el.getAttribute("data-analytics");
    if (/^[a-z0-9_-]{1,64}$/.test(action || "")) {
      window.wbAnalytics.track("site_action", { action: action });
    }
  });
  // Static and browser hash navigation have different pageview lifecycles.
  var lastRoute = cleanCurrentUrl();
  function routeChanged() {
    var next = cleanCurrentUrl();
    if (next !== lastRoute) {
      lastRoute = next;
      posthog.capture("$pageview", { $current_url: next });
    }
  }
  window.addEventListener("hashchange", routeChanged);
  window.addEventListener("popstate", routeChanged);
})();
