// Install one shared analytics bootstrap on every publicly served HTML document.
// Runs after Vite so rebuilding the Universe never wipes the tracking script.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../homepage/", import.meta.url).pathname;
const marker = '<script defer src="/analytics.js" data-site-analytics="v1"></script>';
const action = process.argv[2];
if (!["install", "verify"].includes(action)) throw new Error("Usage: site-analytics.mjs install|verify");
const bootstrapPath = join(root, "analytics.js");
if (!existsSync(bootstrapPath)) throw new Error("Shared analytics bootstrap missing");
const bootstrap = readFileSync(bootstrapPath, "utf8");
for (const fragment of ["posthog.init(projectToken", 'api_host: "https://us.i.posthog.com"', "disable_session_recording: true", "autocapture: false"]) {
  if (!bootstrap.includes(fragment)) throw new Error("Analytics connection or privacy safeguard missing: " + fragment);
}
if (!existsSync(join(root, "privacy.html"))) throw new Error("Privacy controls missing");

const documents = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith(".html")) documents.push(path);
  }
}
walk(root);
if (documents.length < 3) throw new Error("Unexpected HTML output; analytics coverage can't be verified");
for (const path of documents) {
  let html = readFileSync(path, "utf8");
  if (action === "install" && !html.includes(marker)) {
    if (!/<\/head>/i.test(html)) throw new Error("Missing <head>: " + path);
    html = html.replace(/<\/head>/i, marker + "\n</head>");
    writeFileSync(path, html);
  }
  if (html.split(marker).length !== 2) throw new Error("Missing or duplicate analytics tag: " + path);
  if (/posthog\.init\s*\(/.test(html)) throw new Error("Legacy duplicate analytics initializer: " + path);
}
console.log("Analytics coverage " + action + ": " + documents.length + " HTML pages");
