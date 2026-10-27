# Living Universe analytics contract

This applies to every published HTML page and to future worlds, tools, and comets.

## Build, publish and test
- The shared analytics initializer lives in homepage/analytics.js. Its project token is a public browser token, not an admin credential.
- The build automatically injects /analytics.js into EVERY published HTML page, including generated Universe pages; the verification step rejects any missing or duplicate tag or old inline PostHog initialization.
- GitHub Pages CI runs verification after build as a release gate.
- Preview hosts localhost and 127.0.0.1 do not send events to the production analytics project. Actual visits to the live website are not automatically excluded.
- Verify events in PostHog Live Events after publishing; script presence cannot guarantee ingestion when ad blockers or browser privacy features intervene.

## Collect useful behavior, not private content
- Capture pageviews, page leave, selected explicit interactions, and safe public world navigation.
- Do not record session replay, text from clicks, form entries, contact info, search query text, trip itineraries, private comet-tail data, Google tokens, or imported/exported Star Chart contents.
- No broad autocapture. Mark meaningful safe interactions with data-analytics attributes, or call the window.wbAnalytics.track method with approved short slug properties.
- Whitelist event names and property keys, not arbitrary UI text, private field values, or full URLs.
- Use public route IDs rather than titles or sensitive metadata. Sanitize URLs and referrers before transmitting.

## Identity, privacy and geolocation
- Anonymous traffic is measured without persistent browser identity by default (memory persistence). A visitor may explicitly opt into returning-browser recognition (localStorage persistence) or turn analytics off at /privacy.html.
- The opt-out control is available from both the professional homepage and the universe.
- A returning browser, a session, an IP address, a household, and a human person are NOT interchangeable.
- Coarse region/country from provider GeoIP may be useful. Neither IP nor postal code is reliable person identification. Verify actual IP handling in PostHog project settings; the public client cannot force server-side IP deletion.
- Signed-in-family reporting is not implemented. Family sign-in should be Google-backed AND server-verified, use a stable provider subject identifier, and offer a separate opt-in for a recognizable display name. PostHog must never serve as the authorization gate for private itinerary data.
- Owner and development/test traffic: default localhost bypass, and separate self opt-out on live browsers; later use a verified staff tag/cohort to filter authenticated testing.
- Keep the site privacy disclosure current. Jurisdiction-dependent consent requirements need a review before worldwide roll-out of persistent identity.

## Future interactions
- Track generic events when users save/export/import a Star Chart, such as progress_exported with format=*, progress_imported with result=success or failure. NEVER submit file contents or personal saved progress without separate, explicit consent.
- The site's optional Google Drive-folder suggestion is not analytics permission.
- Review event payload examples before each release; test denial of access to private comet data separately from analytics tests.
